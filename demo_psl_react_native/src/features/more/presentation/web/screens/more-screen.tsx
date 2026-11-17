// WEB – More: page header, then the list centred and capped in width.
import { ScrollView, View } from 'react-native'
import { PageHeader } from '../../../../../shared/components/page-header'
import { ReadableWidth } from '../../../../../shared/components/readable-width'
import { PAGE_PADDING } from '../../../../../shared/layout'
import { MoreList } from '../../shared/components/more-list'

export default function MoreScreen() {
  return (
    <View style={{ flex: 1 }}>
      <PageHeader title="More" />
      <ReadableWidth maxWidth={680}>
        <ScrollView contentContainerStyle={{ padding: PAGE_PADDING }}>
          <MoreList />
        </ScrollView>
      </ReadableWidth>
    </View>
  )
}
