// Swift: PSLLegacyLoginHandler.canContinueAutoLogin.
import type { Session } from './entities/session'

const DAY_MS = 24 * 60 * 60 * 1000

/** A session lasts 30 days with "Keep me signed in", otherwise 1 day. */
export const isExpired = (session: Session, now: number): boolean =>
  now >= session.signedInAt + (session.keepSignedIn ? 30 : 1) * DAY_MS
