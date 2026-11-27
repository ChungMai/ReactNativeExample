// Real list after a real sign-in, demo list for the demo account.
import type { NetworkApi } from './network-api'

export class SwitchingNetworkApi implements NetworkApi {
  constructor(private isReal: () => boolean, private real: NetworkApi, private demo: NetworkApi) {}

  private get current() {
    return this.isReal() ? this.real : this.demo
  }
  readOnly = () => this.current.readOnly?.() ?? false
  fetchNetworks = () => this.current.fetchNetworks()
  checkAccess = (id: string) => this.current.checkAccess(id)
  requestToJoin = (id: string) => this.current.requestToJoin(id)
  delete = (id: string) => this.current.delete(id)
  exit = (id: string) => this.current.exit(id)
}
