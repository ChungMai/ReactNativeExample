import type { AppError } from '../../../../shared/domain/app-error'
import type { HomeDTO } from '../dto/home-dto'
import { HOME_SEED } from '../home-seed'

export interface HomeApi {
  fetchHome(): Promise<HomeDTO>
  /** Whose data this is. It changes with the account or network; undefined: the built-in demo home. */
  source?(): string | undefined
  /** true when nothing can be switched or edited. */
  readOnly?(): boolean
}

/** Stub for the hub. Replace the body with a real request when an API exists. */
export class FakeHomeApi implements HomeApi {
  /** Set to an AppError to make requests fail, i.e. "server offline". */
  constructor(public failWith?: AppError, private home: HomeDTO = HOME_SEED) {}

  async fetchHome(): Promise<HomeDTO> {
    if (this.failWith) throw this.failWith
    return this.home
  }
}
