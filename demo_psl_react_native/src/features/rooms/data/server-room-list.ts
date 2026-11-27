import { InMemoryStore } from '../../../shared/data/in-memory-store'
import { toAppError } from '../../../shared/domain/app-error'
import type { ListedRoom, MembersState, RoomList, RoomMembers } from '../domain/entities/listed-room'

const EMPTY: RoomList = { rooms: [], members: {}, loaded: false, serverOnline: true }

export interface RoomSource {
  source(): string
  fetchRooms(): Promise<ListedRoom[]>
  fetchMembers(roomId: string): Promise<RoomMembers>
}

/** The rooms of the real network. Kept apart from the demo rooms, which can be edited. */
export class ServerRoomList {
  private store = new InMemoryStore<RoomList>(EMPTY)
  private source?: string

  constructor(private api: RoomSource, private isReal: () => boolean) {}

  /** true after a real sign-in: the screen shows this list instead of the demo rooms. */
  isActive = () => this.isReal()
  get = () => this.store.get()
  subscribe = (listener: () => void) => this.store.subscribe(listener)

  /** Throws an AppError. */
  refresh = async (): Promise<void> => {
    const source = this.current()
    try {
      const rooms = await this.api.fetchRooms()
      if (source === this.source) this.publish({ rooms, loaded: true, serverOnline: true })
    } catch (e) {
      if (source === this.source) this.publish({ loaded: true, serverOnline: false })
      throw toAppError(e)
    }
  }

  /** A failure is recorded in `members`, not thrown. Members already shown stay until the new answer. */
  loadMembers = async (roomId: string): Promise<void> => {
    const source = this.current()
    const known = this.get().members[roomId]
    const set = (state: MembersState) => {
      if (source === this.source) this.publish({ members: { ...this.get().members, [roomId]: state } })
    }
    if (typeof known !== 'object') set('loading')
    try {
      set(await this.api.fetchMembers(roomId))
    } catch {
      if (typeof known !== 'object') set('error')
    }
  }

  private current() {
    const source = this.api.source()
    if (source !== this.source) {
      this.source = source
      this.store.set(EMPTY) // never show the rooms of another account or network
    }
    return source
  }

  private publish(change: Partial<RoomList>) {
    const next = { ...this.get(), ...change }
    if (JSON.stringify(next) !== JSON.stringify(this.get())) this.store.set(next)
  }
}
