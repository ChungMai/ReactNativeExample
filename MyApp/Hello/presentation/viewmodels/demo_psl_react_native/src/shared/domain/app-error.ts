export type AppErrorCode = 'network' | 'timeout' | 'unknown'

/** The only error type the layers above `data` have to deal with. */
export class AppError extends Error {
  constructor(readonly code: AppErrorCode, message: string, readonly cause?: unknown) {
    super(message)
    this.name = 'AppError'
  }
}

/** Anything thrown (Error, string, ...) becomes an AppError; an AppError is returned as is. */
export function toAppError(e: unknown): AppError {
  if (e instanceof AppError) return e
  return new AppError('unknown', e instanceof Error ? e.message : 'Unknown error', e)
}

const MESSAGES: Record<AppErrorCode, string> = {
  network: 'No connection. Check your network and try again.',
  timeout: 'The request took too long. Please try again.',
  unknown: 'Something went wrong. Please try again.',
}

/** Text that is safe to show to the user. */
export const userMessage = (e: AppError): string => MESSAGES[e.code]
