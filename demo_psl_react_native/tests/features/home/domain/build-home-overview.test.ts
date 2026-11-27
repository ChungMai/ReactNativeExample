import { buildHomeOverview, sortItems, type HomeContent } from '@/features/home/domain/build-home-overview'
import type { HomeCustomization } from '@/features/home/domain/entities/favourites'
import { makeEnv } from '@tests/helpers/make-env'

function content(customization?: HomeCustomization): HomeContent {
  const env = makeEnv()
  return {
    snapshot: { ...env.getHome.execute().snapshot, customization },
    rooms: env.getAllRooms.execute(),
    devices: env.getAllDevices.execute(),
  }
}
const custom = (over: Partial<HomeCustomization> = {}): HomeCustomization => ({
  layout: 'default', sections: [], summary: { hidden: false, items: [] }, itemPositions: [], ...over,
})
const item = (id: string, name: string) => ({ kind: 'device' as const, id, name })

describe('sortItems', () => {
  it('sorts by name ignoring case, then moves placed items; a position past the end appends', () => {
    const items = [item('1', 'beta'), item('2', 'Alpha'), item('3', 'gamma')]
    expect(sortItems(items).map(i => i.id)).toEqual(['2', '1', '3'])
    expect(sortItems(items, [{ id: '3', position: 0 }, { id: '2', position: 9 }]).map(i => i.id)).toEqual(['3', '1', '2'])
  })
})

describe('buildHomeOverview', () => {
  it('lists the sections in the default order with names sorted', () => {
    const overview = buildHomeOverview(content())
    expect(overview.sections.map(s => s.kind)).toEqual(['scene', 'device', 'room', 'group', 'zone', 'preset'])
    expect(overview.sections[1].items.map(i => i.name)).toEqual(['Bedside light', 'Ceiling light'])
    expect(overview.hasFavourites).toBe(true)
  })

  it('counts what is switched on', () => {
    expect(buildHomeOverview(content()).summary).toEqual([
      { kind: 'device', count: 1 }, { kind: 'room', count: 1 }, { kind: 'group', count: 1 }, { kind: 'zone', count: 0 },
    ])
  })

  it('applies custom order, titles and hidden sections', () => {
    const overview = buildHomeOverview(content(custom({
      sections: [
        { kind: 'room', title: 'My rooms', hidden: false },
        { kind: 'device', hidden: false },
        { kind: 'scene', hidden: true },
      ],
    })))
    expect(overview.sections.map(s => s.kind)).toEqual(['room', 'device', 'group', 'zone', 'preset'])
    expect(overview.sections[0].title).toBe('My rooms')
    expect(overview.gridItems.some(i => i.kind === 'scene')).toBe(true) // the grid keeps hidden sections
  })

  it('follows the custom summary, and hides it only in the custom layout', () => {
    const summary = { hidden: true, items: [{ kind: 'zone' as const, hidden: false }, { kind: 'device' as const, hidden: true }] }
    expect(buildHomeOverview(content(custom({ summary }))).summary).toEqual([{ kind: 'zone', count: 0 }])
    expect(buildHomeOverview(content(custom({ summary, layout: 'custom' }))).summary).toEqual([])
  })

  it('skips ids that no longer exist and reports no favourites', () => {
    const base = content()
    const overview = buildHomeOverview({
      ...base,
      rooms: [],
      snapshot: { ...base.snapshot, favourites: { device: ['gone'], group: [], zone: [], scene: [], preset: [] } },
    })
    expect(overview.sections).toEqual([])
    expect(overview.hasFavourites).toBe(false)
  })
})
