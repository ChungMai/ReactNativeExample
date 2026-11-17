import { memo, useCallback, useState } from 'react'
import { Button, Text, View } from 'react-native'

// memo: skip re-rendering when the props are unchanged
const Row = memo(function Row({ id, onRemove }: { id: number; onRemove: (id: number) => void }) {
  console.log('render row', id)
  return <Button title={`Remove ${id}`} onPress={() => onRemove(id)} />
})

export function UseCallbackExample() {
  const [ids, setIds] = useState([1, 2, 3])
  const [tick, setTick] = useState(0)

  // Same function identity across renders, so memoized rows are not re-rendered
  const remove = useCallback((id: number) => setIds(list => list.filter(x => x !== id)), [])

  return (
    <View>
      <Text onPress={() => setTick(t => t + 1)}>Re-render parent: {tick}</Text>
      {ids.map(id => <Row key={id} id={id} onRemove={remove} />)}
    </View>
  )
}
