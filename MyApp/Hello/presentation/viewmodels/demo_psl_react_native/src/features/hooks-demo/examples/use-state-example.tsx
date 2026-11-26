import { useState } from 'react'
import { Button, Text, View } from 'react-native'

interface Profile {
  name: string
  age: number
}

export function UseStateExample() {
  const [count, setCount] = useState(0)
  const [profile, setProfile] = useState<Profile>({ name: 'An', age: 20 })

  return (
    <View style={{ gap: 8 }}>
      <Text>Count: {count}</Text>
      {/* Functional update: always based on the latest value */}
      <Button title="+1" onPress={() => setCount(c => c + 1)} />
      <Button title="+2 (batched)" onPress={() => { setCount(c => c + 1); setCount(c => c + 1) }} />

      <Text>{profile.name}, {profile.age}</Text>
      {/* Objects are immutable: copy, then change */}
      <Button title="Birthday" onPress={() => setProfile(p => ({ ...p, age: p.age + 1 }))} />
    </View>
  )
}
