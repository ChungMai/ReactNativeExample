// Public API of the groups feature. Other features and `app/` may only import from here.
export type { GroupInfo } from './domain/entities/group-info'
// UI: ./presentation/index.native.ts on mobile, ./presentation/index.web.ts on web
export { GroupsScreen } from './presentation'
