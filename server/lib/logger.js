// Structured server logger — swap the implementation here when you outgrow console.
// Callers (handlers, services) never change. Replace write() with Pino, Datadog, Sentry, etc.

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 }
const threshold = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info

const serialize = (context) => {
  if (context instanceof Error) return { message: context.message, stack: context.stack }
  return context
}

const write = (level, message, context) => {
  if (LEVELS[level] < threshold) return

  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...(context !== undefined && { context: serialize(context) }),
  }

  const line = JSON.stringify(entry)
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)
}

export const logger = {
  error: (message, context) => write('error', message, context),
  warn: (message, context) => write('warn', message, context),
  info: (message, context) => write('info', message, context),
  debug: (message, context) => write('debug', message, context),
}
