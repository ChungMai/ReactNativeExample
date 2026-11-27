// After choosing a network the app opens on the Home tab.
import { Redirect } from 'expo-router'

export default function Index() {
  return <Redirect href="/home" />
}
