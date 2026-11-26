import { createContext, ReactNode, useContext, useState } from 'react'
import { Button, Text, View } from 'react-native'

type Theme = 'light' | 'dark'
interface ThemeValue { theme: Theme; toggle: () => void }

const ThemeContext = createContext<ThemeValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const value = { theme, toggle: () => setTheme(t => (t === 'light' ? 'dark' : 'light')) }
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/** Custom hook: hides the context and fails loudly when used outside the provider. */
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}

function ThemedLabel() {
  const { theme, toggle } = useTheme() // no prop drilling
  return (
    <View>
      <Text>Current theme: {theme}</Text>
      <Button title="Switch" onPress={toggle} />
    </View>
  )
}

export function UseContextExample() {
  return (
    <ThemeProvider>
      <ThemedLabel />
    </ThemeProvider>
  )
}
