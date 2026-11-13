import { makeEnv } from '@tests/helpers/make-env'

describe('GetAllRoomsUseCase / GetRoomDetailInfoUseCase', () => {
  it('lists every room', () => {
    expect(makeEnv().getAllRooms.execute().map(r => r.id)).toEqual(['r1', 'r2', 'r3'])
  })

  it('finds a room by id, or undefined', () => {
    const env = makeEnv()
    expect(env.getRoomDetailInfo.execute('r2')?.name).toBe('Virtual Room')
    expect(env.getRoomDetailInfo.execute('nope')).toBeUndefined()
    expect(env.getRoomDetailInfo.execute(undefined)).toBeUndefined()
  })
})

describe('CheckRoomNameUseCase', () => {
  it.each([['Kitchen', true], ['  Kitchen  ', true], ['', false], ['   ', false]])(
    'name %j -> %s',
    (name, expected) => expect(makeEnv().checkRoomName.execute(name)).toBe(expected),
  )
})

describe('CreateRoomUseCase', () => {
  beforeEach(() => jest.spyOn(Date, 'now').mockReturnValue(1_000))
  afterEach(() => jest.restoreAllMocks())

  it('adds a trimmed, non-favourite room with a generated id and timestamp', () => {
    const env = makeEnv()
    env.createRoom.execute({ name: '  Kitchen ', cover: 2, deviceIds: ['d4'] })
    const created = env.getAllRooms.execute().at(-1)!
    expect(created).toEqual({
      id: 'r1000', name: 'Kitchen', cover: 2, deviceIds: ['d4'], favourite: false, createdAt: 1_000,
    })
    expect(env.getAllRooms.execute()).toHaveLength(4)
  })
})

describe('DeleteRoomUseCase', () => {
  it('removes only the given room', () => {
    const env = makeEnv()
    env.deleteRoom.execute('r2')
    expect(env.getAllRooms.execute().map(r => r.id)).toEqual(['r1', 'r3'])
  })

  it('does nothing for an unknown id', () => {
    const env = makeEnv()
    env.deleteRoom.execute('nope')
    expect(env.getAllRooms.execute()).toHaveLength(3)
  })
})

describe('UpdateRoomAttributesUseCase', () => {
  it('updates the given attributes of one room and leaves the others alone', () => {
    const env = makeEnv()
    env.updateRoomAttributes.execute('r2', { favourite: true, name: 'Renamed' })
    const [r1, r2] = env.getAllRooms.execute()
    expect(r2).toMatchObject({ favourite: true, name: 'Renamed', deviceIds: ['d1', 'd2', 'd3'] })
    expect(r1.name).toBe('Room 11')
  })
})

describe('TriggerRoomUseCase', () => {
  it("switches every device of the room, and only those devices", () => {
    const env = makeEnv()
    env.triggerRoom.execute('r2', true)
    const d = env.getAllDevices.execute()
    expect([d.d1.on, d.d2.on, d.d3.on, d.d4.on]).toEqual([true, true, true, false])
    env.triggerRoom.execute('r2', false)
    expect(env.getAllDevices.execute().d1.on).toBe(false)
  })

  it('does nothing for an unknown room or a room without devices', () => {
    const env = makeEnv()
    const before = env.getAllDevices.execute()
    env.triggerRoom.execute('nope', true)
    env.triggerRoom.execute('r1', true) // "Room 11" has no devices
    expect(env.getAllDevices.execute()).toEqual(before)
  })

  it('shows up in the derived room power', () => {
    const env = makeEnv()
    env.triggerRoom.execute('r3', false) // Bedroom: d6 starts on
    expect(env.getAllDevices.execute().d6.on).toBe(false)
  })
})
