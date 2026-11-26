import { ElementRef, useRef, useState } from 'react'
import { Button, Text, TextInput, View } from 'react-native'
import { usePrevious } from '../hooks/use-previous'

export function UseRefExample() {
  const inputRef = useRef<ElementRef<typeof TextInput>>(null) // 1) reference to a native element
  const renders = useRef(0) // 2) mutable box: changing it does NOT re-render
  // Demo only: React's lint rule discourages writing refs during render. This line is the point of the demo.
  // eslint-disable-next-line react-hooks/refs
  renders.current += 1

  const [text, setText] = useState('')
  const previous = usePrevious(text) // 3) value from the previous render

  return (
    <View style={{ gap: 8 }}>
      <TextInput ref={inputRef} value={text} onChangeText={setText} placeholder="Type here" />
      <Button title="Focus input" onPress={() => inputRef.current?.focus()} />
      {/* eslint-disable-next-line react-hooks/refs */}
      <Text>Renders: {renders.current}</Text>
      <Text>Previous text: {previous ?? '(none)'}</Text>
    </View>
  )
}
