import { ScrollView, Text, TextInput, View } from 'react-native'
import { ReadableWidth } from '../../shared/components/readable-width'
import { colors } from '../../shared/theme'
import { useDebounce } from './hooks/use-debounce'
import { useToggle } from './hooks/use-toggle'
import { NativeHooksExample } from './examples/native-hooks-example'
import { UseCallbackExample } from './examples/use-callback-example'
import { UseContextExample } from './examples/use-context-example'
import { UseEffectExample } from './examples/use-effect-example'
import { UseMemoExample } from './examples/use-memo-example'
import { UseReducerExample } from './examples/use-reducer-example'
import { UseRefExample } from './examples/use-ref-example'
import { UseStateExample } from './examples/use-state-example'
import { useState } from 'react'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 8, padding: 12, gap: 8 }}>
      <Text style={{ fontWeight: '700', color: colors.primary }}>{title}</Text>
      {children}
    </View>
  )
}

function CustomHooksExample() {
  const [open, toggle] = useToggle()
  const [text, setText] = useState('')
  const debounced = useDebounce(text)
  return (
    <View style={{ gap: 4 }}>
      <Text onPress={toggle}>useToggle: {open ? 'ON' : 'OFF'} (tap)</Text>
      <TextInput value={text} onChangeText={setText} placeholder="useDebounce" />
      <Text>Debounced: {debounced}</Text>
    </View>
  )
}

export default function HooksDemoScreen() {
  return (
    <ReadableWidth>
      <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Section title="useState"><UseStateExample /></Section>
        <Section title="useEffect"><UseEffectExample userId="42" /></Section>
        <Section title="useRef"><UseRefExample /></Section>
        <Section title="useMemo"><UseMemoExample /></Section>
        <Section title="useCallback"><UseCallbackExample /></Section>
        <Section title="useReducer"><UseReducerExample /></Section>
        <Section title="useContext"><UseContextExample /></Section>
        <Section title="Custom hooks"><CustomHooksExample /></Section>
        <Section title="React Native hooks"><NativeHooksExample /></Section>
      </ScrollView>
    </ReadableWidth>
  )
}
