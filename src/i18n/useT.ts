import { useGameStore } from '../store/gameStore'
import { type StringKey, t as translate } from './strings'

export function useT() {
  const locale = useGameStore((s) => s.locale)
  return (key: StringKey) => translate(key, locale)
}
