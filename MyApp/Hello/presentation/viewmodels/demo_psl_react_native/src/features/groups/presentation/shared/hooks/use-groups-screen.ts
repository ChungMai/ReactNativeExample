import { useState } from 'react'
import type { GroupInfo } from '../../../domain/entities/group-info'

export function useGroupsScreen() {
  const [groups, setGroups] = useState<GroupInfo[]>([])
  const [name, setName] = useState('')

  const canAdd = name.trim().length > 0 // derived, not state

  return {
    groups, name, canAdd,
    setName,
    addGroup: () => {
      if (!canAdd) return
      setGroups(prev => [...prev, { id: Date.now().toString(), name: name.trim() }])
      setName('')
    },
    removeGroup: (id: string) => setGroups(prev => prev.filter(g => g.id !== id)),
  }
}
