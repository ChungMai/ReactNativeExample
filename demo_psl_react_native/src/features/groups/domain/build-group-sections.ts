// Swift: GroupsMainViewController.updatedCollectionView: search, then group by category and sort by name.
import { GROUP_CATEGORIES, type GroupCategory, type ListedGroup } from './entities/listed-group'

export interface GroupSection {
  category: GroupCategory
  groups: ListedGroup[]
}

export function buildGroupSections(groups: ListedGroup[], search = '', ascending = true): GroupSection[] {
  const text = search.trim().toLowerCase()
  const direction = ascending ? 1 : -1
  const shown = groups
    .filter(g => g.name.toLowerCase().includes(text))
    .sort((a, b) => direction * a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  return GROUP_CATEGORIES
    .map(category => ({ category, groups: shown.filter(g => g.category === category) }))
    .filter(section => section.groups.length > 0)
}
