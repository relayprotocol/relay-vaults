import tracer from 'dd-trace'

const SERVICE_NAME = process.env.SERVICE_NAME || 'vaults-backend'
const ENVIRONMENT =
  process.env.ENVIRONMENT || process.env.NODE_ENV || 'development'

tracer.init({
  // Disable client IP collection for security
  clientIpEnabled: false,

  // Service configuration
  env: ENVIRONMENT,

  // Logging configuration
  logInjection: true,

  // disable all auto-instrumentation
  plugins: false,

  // Service configuration
  service: SERVICE_NAME,

  // Tags for better organization
  tags: {
    environment: ENVIRONMENT,
    service: SERVICE_NAME,
    version: process.env.IMAGE_TAG || 'unknown',
  },

  // Network configuration
  url: process.env.DATADOG_AGENT_URL || 'http://localhost:8126',
})

const traceEvent = (ponder, eventName: string, eventHandler) => {
  const handlerWithLog = ({ event, context }) => {
    const span = tracer.startSpan(eventName)
    span.setTag('chain', context.chain)
    span.setTag('args', event.arg)
    span.setTag('log', event.log)
    span.setTag('transaction', event.transaction)
    span.finish()
    return eventHandler({ context, event })
  }

  ponder.on(eventName, handlerWithLog)
}

export { tracer, traceEvent }
