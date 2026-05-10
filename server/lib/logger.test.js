import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  delete process.env.LOG_LEVEL
})

// Re-import with fresh module state for each level test
const getLogger = async (level) => {
  process.env.LOG_LEVEL = level
  vi.resetModules()
  const { logger } = await import('./logger.js')
  return logger
}

describe('logger output', () => {
  it('logger.info writes JSON to console.log', async () => {
    const logger = await getLogger('info')
    logger.info('hello')
    const parsed = JSON.parse(console.log.mock.calls[0][0])
    expect(parsed.level).toBe('info')
    expect(parsed.message).toBe('hello')
    expect(typeof parsed.time).toBe('string')
  })

  it('logger.warn writes JSON to console.warn', async () => {
    const logger = await getLogger('warn')
    logger.warn('watch out')
    const parsed = JSON.parse(console.warn.mock.calls[0][0])
    expect(parsed.level).toBe('warn')
    expect(parsed.message).toBe('watch out')
  })

  it('logger.error writes JSON to console.error', async () => {
    const logger = await getLogger('error')
    logger.error('something broke')
    const parsed = JSON.parse(console.error.mock.calls[0][0])
    expect(parsed.level).toBe('error')
    expect(parsed.message).toBe('something broke')
  })

  it('includes context when provided', async () => {
    const logger = await getLogger('info')
    logger.info('request received', { method: 'GET', path: '/things' })
    const parsed = JSON.parse(console.log.mock.calls[0][0])
    expect(parsed.context).toEqual({ method: 'GET', path: '/things' })
  })

  it('omits context key when no context is provided', async () => {
    const logger = await getLogger('info')
    logger.info('no context')
    const parsed = JSON.parse(console.log.mock.calls[0][0])
    expect(parsed).not.toHaveProperty('context')
  })

  it('serializes Error context to message and stack', async () => {
    const logger = await getLogger('error')
    const err = new Error('db connection failed')
    logger.error('handler error', err)
    const parsed = JSON.parse(console.error.mock.calls[0][0])
    expect(parsed.context.message).toBe('db connection failed')
    expect(typeof parsed.context.stack).toBe('string')
  })
})

describe('logger level filtering', () => {
  it('suppresses debug logs when level is info', async () => {
    const logger = await getLogger('info')
    logger.debug('verbose detail')
    expect(console.log).not.toHaveBeenCalled()
  })

  it('suppresses info and debug logs when level is warn', async () => {
    const logger = await getLogger('warn')
    logger.info('info message')
    logger.debug('debug message')
    expect(console.log).not.toHaveBeenCalled()
  })

  it('allows warn logs when level is warn', async () => {
    const logger = await getLogger('warn')
    logger.warn('this should log')
    expect(console.warn).toHaveBeenCalledTimes(1)
  })

  it('allows error logs regardless of level', async () => {
    const logger = await getLogger('warn')
    logger.error('always logs')
    expect(console.error).toHaveBeenCalledTimes(1)
  })

  it('defaults to info level when LOG_LEVEL is unset', async () => {
    delete process.env.LOG_LEVEL
    vi.resetModules()
    const { logger } = await import('./logger.js')
    logger.debug('should be suppressed')
    logger.info('should appear')
    expect(console.log).toHaveBeenCalledTimes(1)
  })
})
