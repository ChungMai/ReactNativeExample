import type { ImageSourcePropType } from 'react-native'
import type { IconName } from '../../../../../shared/navigation/shared/nav-items'
import type { FavouriteKind, SummaryKind } from '../../../domain/entities/favourites'

export interface CardDisplay {
  key: string
  kind: FavouriteKind
  id: string
  title: string
  icon: IconName
  coverSource?: ImageSourcePropType // rooms only
  stateLabel: 'On' | 'Off' | null // null: nothing to show (scene, preset, empty room)
  isOn: boolean
  accessibilityLabel: string
}

export interface SectionDisplay {
  kind: FavouriteKind
  title: string
  cards: CardDisplay[]
}

export interface SummaryDisplay {
  kind: SummaryKind
  icon: IconName
  title: string
  subtitle: string
}
