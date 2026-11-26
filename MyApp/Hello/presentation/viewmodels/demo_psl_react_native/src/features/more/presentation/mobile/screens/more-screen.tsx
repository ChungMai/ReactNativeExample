// MOBILE – More: the native tab header shows the title, so the screen is just the list.
import { ScrollView } from 'react-native'
import { MoreList } from '../../shared/components/more-list'

export default function MoreScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16 }}>
      <MoreList />
    </ScrollView>
  )
}
