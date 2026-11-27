// Swift: PSLAuthValidation.isValidURL and PSLAuthUtils.ensureHTTPS. Unlike Swift, http is refused.
export type AddressError = 'empty' | 'invalid'
export type AddressCheck = { url: string; error?: never } | { error: AddressError; url?: never }

const IPV4 = /^(\d{1,3}\.){3}\d{1,3}$/
const NAME = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/

export function checkServerAddress(input: string): AddressCheck {
  const text = input.trim().toLowerCase().replace(/\/+$/, '')
  if (!text) return { error: 'empty' }
  const rest = text.replace(/^https:\/\//, '')
  const [host, port, ...more] = rest.split(':')
  const validHost = IPV4.test(host) ? host.split('.').every(part => Number(part) <= 255) : NAME.test(host)
  const validPort = port === undefined || (/^\d{1,5}$/.test(port) && Number(port) <= 65535)
  return validHost && validPort && more.length === 0 ? { url: `https://${rest}` } : { error: 'invalid' }
}
