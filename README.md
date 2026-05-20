# Reflejos IA

Juego de reflejos con detección de manos en tiempo real, 100% en el navegador.

Atrapa los bastones que caen moviendo tus manos frente a la cámara. Usa visión por computadora con MediaPipe (corre en WebAssembly + GPU del navegador) y un motor de juego en Phaser para un loop suave a 60fps.

> Versión moderna de [AX_JUEGO.py](AX_JUEGO.py), reescrita como aplicación web desplegable.

## Stack

- **Vite + React + TypeScript** — base de la app
- **Phaser 3** — motor de juego 2D
- **@mediapipe/tasks-vision** — detección de manos (modelo Hand Landmarker)
- **Zustand** — estado global con persistencia (récord, ajustes)
- **Howler.js** — audio (efectos generados sintéticamente)
- **Tailwind CSS** + **Framer Motion** — UI y animaciones
- **vite-plugin-pwa** — instalable y funciona offline

## Desarrollo

```bash
yarn install
yarn dev
```

Abre <http://localhost:5173>.

## Build

```bash
yarn build
yarn preview
```

## Deploy gratis en Vercel

### Opción 1 — Desde GitHub (recomendado)

1. Crea un repo en GitHub y haz push de este proyecto.
2. Entra a [vercel.com/new](https://vercel.com/new), importa el repositorio.
3. Vercel detecta `vercel.json` automáticamente. Click en **Deploy**.

### Opción 2 — CLI

```bash
npx vercel        # primera vez (crea proyecto)
npx vercel --prod # despliega a producción
```

## Privacidad

Todo el procesamiento (cámara + IA) ocurre en tu navegador. **Ninguna imagen ni dato sale de tu dispositivo.**

## Notas

- HTTPS es obligatorio para `getUserMedia` — Vercel lo provee automáticamente.
- Modelo MediaPipe (~10 MB) se carga la primera vez y queda cacheado por el service worker (PWA).
- Soporta hasta 2 manos simultáneas. La caja de detección usa los 5 dedos de cada mano.
