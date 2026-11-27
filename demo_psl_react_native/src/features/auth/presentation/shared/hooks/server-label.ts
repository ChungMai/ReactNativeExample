export const DEFAULT_SERVER = 'Default Server'
export const CUSTOM_SERVER = 'Custom Server'

export const serverLabel = (url: string | undefined) => (url ? url.replace(/^https:\/\//, '') : DEFAULT_SERVER)
