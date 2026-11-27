// Signs in against whichever server is selected at that moment.
import type { ServerSettings } from '../../domain/entities/server'
import type { AuthApi } from './auth-api'

export class SelectedServerAuthApi implements AuthApi {
  private perServer = new Map<string, AuthApi>()

  constructor(
    private settings: () => ServerSettings,
    private defaultUrl: string | undefined,
    private connect: (url: string) => AuthApi,
    /** Used for the default server when no address is configured. */
    private demo: AuthApi,
    /** Forgets the previous user's tokens. */
    private forget: () => void = () => {},
  ) {}

  signIn(email: string, password: string): Promise<boolean> {
    const url = this.settings().selected ?? this.defaultUrl
    this.forget()
    if (!url) return this.demo.signIn(email, password)
    let api = this.perServer.get(url)
    if (!api) this.perServer.set(url, (api = this.connect(url)))
    return api.signIn(email, password)
  }
}
