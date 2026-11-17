// Centres a page and caps its width, so forms and detail pages stay readable on a wide screen.
import type { ReactNode } from 'react'
import { View } from 'react-native'

export function ReadableWidth({ children, maxWidth = 720 }: { children: ReactNode; maxWidth?: number }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <View style={{ flex: 1, width: '100%', maxWidth }}>{children}</View>
    </View>
  )
}
