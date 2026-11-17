import { useRouter, useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { Button, Text, useColorScheme, useWindowDimensions, View } from 'react-native'
import { useAppState } from '../hooks/use-app-state'

export function NativeHooksExample() {
  const { width, height } = useWindowDimensions() // updates on rotation
  const scheme = useColorScheme() // 'light' | 'dark' | null
  const appState = useAppState() // custom hook around AppState
  const router = useRouter()

  // Runs every time this screen gains focus (not only on mount)
  useFocusEffect(
    useCallback(() => {
      console.log('screen focused')
      return () => console.log('screen blurred')
    }, []),
  )

  return (
    <View>
      <Text>{Math.round(width)} x {Math.round(height)}</Text>
      <Text>Color scheme: {scheme ?? 'unknown'}</Text>
      <Text>App state: {appState}</Text>
      <Button title="Go back" onPress={() => router.back()} />
    </View>
  )
}
