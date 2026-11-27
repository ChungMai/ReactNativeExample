// Real data after a real sign-in, demo data for the demo account.
import type { HomeApi } from './home-api'

export class SwitchingHomeApi implements HomeApi {
  constructor(private isReal: () => boolean, private real: HomeApi, private demo: HomeApi) {}

  private get current() {
    return this.isReal() ? this.real : this.demo
  }
  source = () => this.current.source?.()
  readOnly = () => this.current.readOnly?.() ?? false
  fetchHome = () => this.current.fetchHome()
}
