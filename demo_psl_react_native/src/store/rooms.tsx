// App state: a pure reducer + useReducer, shared through two contexts.
import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react'
import { SEED } from '../data/seed'
import { assertNever, type Action, type Device, type Room, type RoomPower, type State } from '../types'

export function roomsReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'addRoom': {
      const room: Room = { ...action.room, id: 'r' + Date.now(), favourite: false, createdAt: Date.now() }
      return { ...state, rooms: [...state.rooms, room] }
    }
    case 'removeRoom':
      return { ...state, rooms: state.rooms.filter(r => r.id !== action.id) }
    case 'toggleFavourite':
      return {
        ...state,
        rooms: state.rooms.map(r => (r.id === action.id ? { ...r, favourite: !r.favourite } : r)),
      }
    case 'setRoomPower': {
      const room = state.rooms.find(r => r.id === action.id)
      if (!room) return state
      const devices = { ...state.devices }
      for (const id of room.deviceIds) devices[id] = { ...devices[id], on: action.on }
      return { ...state, devices }
    }
    case 'toggleDevice': {
      const d = state.devices[action.id]
      return { ...state, devices: { ...state.devices, [d.id]: { ...d, on: !d.on } } }
    }
    default:
      return assertNever(action) // compile error if a case is missing
  }
}

const StateContext = createContext<State | null>(null)
const DispatchContext = createContext<Dispatch<Action> | null>(null)

export function RoomsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(roomsReducer, SEED)
  return (
    <StateContext value={state}>
      <DispatchContext value={dispatch}>{children}</DispatchContext>
    </StateContext>
  )
}

export function useRoomsState(): State {
  const s = useContext(StateContext)
  if (!s) throw new Error('useRoomsState must be used inside <RoomsProvider>')
  return s
}

export function useRoomsDispatch(): Dispatch<Action> {
  const d = useContext(DispatchContext)
  if (!d) throw new Error('useRoomsDispatch must be used inside <RoomsProvider>')
  return d
}

/** Room + its devices + derived power state. */
export function useRoom(id: string | undefined) {
  const { rooms, devices } = useRoomsState()
  const room = rooms.find(r => r.id === id)
  if (!room) return undefined
  const list: Device[] = room.deviceIds.map(d => devices[d])
  return { room, devices: list, power: powerOf(list) }
}

export function powerOf(devices: Device[]): RoomPower {
  if (devices.length === 0) return 'empty'
  return devices.some(d => d.on) ? 'on' : 'off'
}
