// Swift: availableSwipeActions, makeDeleteAction, makeExitAction, hasPermissionToLoginNetwork.
import type { JoinedNetwork } from './entities/network'

export type NetworkAction = 'delete' | 'exit'

export function availableActions({ role, mode, primaryUserCount }: JoinedNetwork): NetworkAction[] {
  if (role === 'secondary') return ['exit']
  if (mode !== 'local' && mode !== 'troubleshoot') return ['delete', 'exit']
  if (primaryUserCount > 1) return ['delete', 'exit']
  return primaryUserCount === 1 ? ['delete'] : ['exit']
}

/** Deleting needs the server and local access to the hub; leaving only needs the server. */
export function isActionEnabled(action: NetworkAction, { mode }: JoinedNetwork, serverOnline: boolean): boolean {
  if (!serverOnline) return false
  return action === 'exit' || mode === 'local' || mode === 'troubleshoot'
}
