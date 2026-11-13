import { AppError, toAppError, userMessage } from '@/shared/domain/app-error'

describe('AppError', () => {
  it('keeps its code, message and cause', () => {
    const cause = new Error('socket closed')
    const e = new AppError('network', 'offline', cause)
    expect(e).toBeInstanceOf(Error)
    expect(e).toMatchObject({ name: 'AppError', code: 'network', message: 'offline', cause })
  })
})

describe('toAppError', () => {
  it('returns an AppError unchanged', () => {
    const e = new AppError('timeout', 't')
    expect(toAppError(e)).toBe(e)
  })

  it('wraps a plain Error as unknown, keeping the message and the cause', () => {
    const original = new Error('boom')
    expect(toAppError(original)).toMatchObject({ code: 'unknown', message: 'boom', cause: original })
  })

  it('wraps a non-Error value', () => {
    expect(toAppError('oops')).toMatchObject({ code: 'unknown', message: 'Unknown error', cause: 'oops' })
  })
})

describe('userMessage', () => {
  it.each(['network', 'timeout', 'unknown'] as const)('has text for %s that never leaks the technical message', code => {
    const text = userMessage(new AppError(code, 'ECONNRESET 10.0.0.1'))
    expect(text.length).toBeGreaterThan(0)
    expect(text).not.toContain('ECONNRESET')
  })
})
