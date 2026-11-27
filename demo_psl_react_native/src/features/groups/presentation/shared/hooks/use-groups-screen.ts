// View model of the group list. Swift: GroupsMainViewModel.
import { useFocusEffect } from 'expo-router'
import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { container } from '../../../../../di/container'
import { toAppError, userMessage } from '../../../../../shared/domain/app-error'
import { buildGroupSections } from '../../../domain/build-group-sections'
import type { GroupCategory } from '../../../domain/entities/listed-group'

export const POLL_INTERVAL_MS = 10_000

export function useGroupsScreen() {
  const list = container.serverGroups
  const { groups, loaded, serverOnline } = useSyncExternalStore(list.subscribe, list.get)
  const [search, setSearch] = useState('')
  const [ascending, setAscending] = useState(true)
  const [toggled, setToggled] = useState<GroupCategory[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      await list.refresh()
      setError(null)
    } catch (e) {
      setError(userMessage(toAppError(e)))
    }
  }, [list])

  // Load and poll only while the screen is shown.
  useFocusEffect(
    useCallback(() => {
      load()
      const timer = setInterval(load, POLL_INTERVAL_MS)
      return () => clearInterval(timer)
    }, [load]),
  )

  const sections = useMemo(() => buildGroupSections(groups, search, ascending), [groups, search, ascending])
  const searching = search.trim() !== ''
  // a single section starts open, as in the Swift app
  const openByDefault = sections.length === 1

  return {
    loaded,
    serverOnline,
    error,
    refreshing,
    search,
    setSearch,
    ascending,
    toggleSort: () => setAscending(v => !v),
    hasGroups: groups.length > 0,
    sections: sections.map(s => ({
      category: s.category,
      count: s.groups.length,
      // a search shows its matches without having to open the sections
      isExpanded: searching || toggled.includes(s.category) !== openByDefault,
      groups: s.groups,
    })),
    toggleSection: (category: GroupCategory) =>
      setToggled(all => (all.includes(category) ? all.filter(c => c !== category) : [...all, category])),
    refresh: async () => {
      setRefreshing(true)
      await load()
      setRefreshing(false)
    },
  }
}
