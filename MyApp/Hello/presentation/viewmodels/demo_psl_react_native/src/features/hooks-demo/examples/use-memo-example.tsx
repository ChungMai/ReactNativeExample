import { useMemo, useState } from 'react'
import { Text, TextInput, View } from 'react-native'

const PEOPLE = Array.from({ length: 5000 }, (_, i) => `Person ${i}`)

export function UseMemoExample() {
  const [query, setQuery] = useState('')
  const [dark, setDark] = useState(false)

  // Recomputed only when `query` changes – not when `dark` changes
  const filtered = useMemo(
    () => PEOPLE.filter(p => p.toLowerCase().includes(query.toLowerCase())),
    [query],
  )

  return (
    <View style={{ backgroundColor: dark ? '#111' : '#fff' }}>
      <TextInput value={query} onChangeText={setQuery} placeholder="Search" />
      <Text onPress={() => setDark(d => !d)}>Toggle theme</Text>
      <Text>{filtered.length} results</Text>
    </View>
  )
}
