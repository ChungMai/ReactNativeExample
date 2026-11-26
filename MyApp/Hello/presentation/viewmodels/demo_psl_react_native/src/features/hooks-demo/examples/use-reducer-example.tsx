import { useReducer } from 'react'
import { Button, Text, View } from 'react-native'

interface Todo { id: number; title: string; done: boolean }

type Action =
  | { type: 'add'; title: string }
  | { type: 'toggle'; id: number }
  | { type: 'remove'; id: number }

function reducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case 'add':
      return [...state, { id: Date.now(), title: action.title, done: false }]
    case 'toggle':
      return state.map(t => (t.id === action.id ? { ...t, done: !t.done } : t))
    case 'remove':
      return state.filter(t => t.id !== action.id)
  }
}

export function UseReducerExample() {
  const [todos, dispatch] = useReducer(reducer, [])

  return (
    <View>
      <Button title="Add todo" onPress={() => dispatch({ type: 'add', title: 'Learn hooks' })} />
      {todos.map(t => (
        <Text
          key={t.id}
          style={{ textDecorationLine: t.done ? 'line-through' : 'none' }}
          onPress={() => dispatch({ type: 'toggle', id: t.id })}
          onLongPress={() => dispatch({ type: 'remove', id: t.id })}
        >
          {t.title}
        </Text>
      ))}
    </View>
  )
}
