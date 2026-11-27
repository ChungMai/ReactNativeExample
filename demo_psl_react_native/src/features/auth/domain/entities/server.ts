/** Which server accounts are checked against. Addresses are normalised https URLs. */
export interface ServerSettings {
  /** undefined: the default server. */
  readonly selected?: string
  /** Servers connected to before. */
  readonly saved: readonly string[]
}
