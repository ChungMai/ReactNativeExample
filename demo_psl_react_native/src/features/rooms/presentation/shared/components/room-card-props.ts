// Same props on every platform: only the look changes (room-card.native.tsx / room-card.web.tsx).
import type { RoomDisplay } from '../models/room-display'

export type RoomCardProps = { room: RoomDisplay; onPress: () => void }
