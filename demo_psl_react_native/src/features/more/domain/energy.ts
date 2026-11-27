export interface EnergyDay {
  /** The network's time zone, for the hour labels. */
  timeZone?: string
  /** kWh of the whole day; undefined when the server has no figure. */
  total?: number
  /** kWh per hour; undefined for an hour without data. `time` is in seconds. */
  hours: { time: number; kwh?: number }[]
}

export function hourLabel(time: number, timeZone?: string): string {
  const date = new Date(time * 1000)
  const format = (zone?: string) =>
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: zone }).format(date)
  try {
    return format(timeZone)
  } catch {
    return format() // a time zone name this device does not know
  }
}
