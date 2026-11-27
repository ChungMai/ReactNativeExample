// expo-router for Home tests: useFocusEffect behaves like useEffect (the screen is focused while mounted).
import { useEffect } from 'react'

export const router = { push: jest.fn(), back: jest.fn() }
export const useFocusEffect = (effect: () => void | (() => void)) => useEffect(effect, [effect])
export const Stack = {
  // renders the header button so screens can be tested end to end
  Screen: ({ options }: { options?: { headerRight?: () => unknown } }) => options?.headerRight?.() ?? null,
}
