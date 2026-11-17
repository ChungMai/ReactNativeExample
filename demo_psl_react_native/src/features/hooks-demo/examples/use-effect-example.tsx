import { useEffect, useState } from 'react'
import { Text } from 'react-native'

export function UseEffectExample({ userId }: { userId: string }) {
  const [seconds, setSeconds] = useState(0)

  // 1) Runs once after the first render ([] = no dependencies)
  useEffect(() => {
    console.log('mounted')
    return () => console.log('unmounted') // cleanup on unmount
  }, [])

  // 2) Runs again whenever `userId` changes
  useEffect(() => {
    console.log('load user', userId)
  }, [userId])

  // 3) Timer with cleanup – without it the interval keeps running (leak)
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return <Text>Seconds: {seconds}</Text>
}
