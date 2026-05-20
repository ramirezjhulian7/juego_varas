import cv2
import mediapipe as mp
import random
import time

# Inicializar MediaPipe Hands (IA para detectar manos)
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=2, min_detection_confidence=0.7)
mp_draw = mp.solutions.drawing_utils

# Configuración de la ventana y la cámara
cap = cv2.VideoCapture(0)
cv2.namedWindow("Juego de Reflejos - IA", cv2.WINDOW_NORMAL)

# Variables del juego
puntos = 0
bastones = []  # Lista para guardar los bastones activos
ultimo_baston_tiempo = 0
intervalo_aparicion = 1.5  # Segundos entre cada bastón

# Configuración física de los bastones digitales
ANCHO_BASTON = 30
LARGO_BASTON = 120
VELOCIDAD_BASTON = 12  # Píxeles por fotograma

while cap.isOpened():
    success, frame = cap.read()
    if not success:
        print("No se pudo acceder a la cámara web.")
        break

    # Voltear la imagen horizontalmente (efecto espejo natural para el usuario)
    frame = cv2.flip(frame, 1)
    alto, ancho, _ = frame.shape

    # Convertir la imagen a RGB (MediaPipe usa RGB, OpenCV usa BGR)
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    resultados = hands.process(rgb_frame)

    # --- LÓGICA DE APARICIÓN DE BASTONES ---
    tiempo_actual = time.time()
    if tiempo_actual - ultimo_baston_tiempo > intervalo_aparicion:
        # Crear un bastón en una posición X aleatoria en la parte superior
        baston_x = random.randint(50, ancho - 50)
        bastones.append({'x': baston_x, 'y': 0, 'atrapado': False})
        ultimo_baston_tiempo = tiempo_actual

    # --- LÓGICA DE DETECCIÓN DE MANOS (IA) ---
    coordenadas_manos = []
    if resultados.multi_hand_landmarks:
        for hand_landmarks in resultados.multi_hand_landmarks:
            # Dibujar el esqueleto de la mano en pantalla para feedback visual
            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            
            # Obtener la posición del dedo índice (Landmark 8) y el pulgar (Landmark 4)
            # para simular una "pinza" o zona de agarre.
            indice = hand_landmarks.landmark[8]
            ix, iy = int(indice.x * ancho), int(indice.y * alto)
            coordenadas_manos.append((ix, iy))

    # --- ACTUALIZAR Y DIBUJAR BASTONES ---
    bastones_vivos = []
    for baston in bastones:
        # Hacer caer el bastón
        baston['y'] += VELOCIDAD_BASTON

        # Dibujar el bastón (un rectángulo rojo con punta redondeada simulada)
        cv2.rectangle(frame, (baston['x'], baston['y']), 
                      (baston['x'] + ANCHO_BASTON, baston['y'] + LARGO_BASTON), 
                      (0, 0, 255), -1) # Color Rojo (BGR)

        # Verificar colisión (¿La mano tocó el bastón?)
        atrapado = False
        for (mx, my) in coordenadas_manos:
            # Comprobar si las coordenadas de la mano están dentro del rectángulo del bastón
            if (baston['x'] <= mx <= baston['x'] + ANCHO_BASTON) and \
               (baston['y'] <= my <= baston['y'] + LARGO_BASTON):
                atrapado = True
                puntos += 1
                break # Rompe el ciclo de manos para este bastón

        # Si no se atrapó y no ha salido de la pantalla, sigue activo
        if not atrapado and baston['y'] < alto:
            bastones_vivos.append(baston)
            
    bastones = bastones_vivos

    # --- INTERFAZ DE USUARIO EN PANTALLA ---
    # Mostrar el puntaje actual
    cv2.putText(frame, f"Puntos: {puntos}", (30, 60), 
                cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 0), 3)
    
    # Mostrar instrucciones de salida
    cv2.putText(frame, "Presiona 'q' para salir", (30, alto - 30), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    # Mostrar la ventana del juego
    cv2.imshow("Juego de Reflejos - IA", frame)

    # Salir si se presiona la tecla 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()