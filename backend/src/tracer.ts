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

  // Performance monitoring
  profiling: process.env.DD_PROFILING_ENABLED === 'false',

  runtimeMetrics: process.env.DD_RUNTIME_METRICS_ENABLED === 'false',

  // Sampling configuration
  sampleRate: process.env.DD_TRACE_SAMPLE_RATE
    ? parseFloat(process.env.DD_TRACE_SAMPLE_RATE)
    : 1.0,

  // Service configuration
  service: SERVICE_NAME,

  // Tags for better organization
  tags: {
    environment: ENVIRONMENT,
    service: SERVICE_NAME,
    version: process.env.IMAGE_TAG || 'unknown',
  },

  // Network configuration
  url:
    process.env.DD_AGENT_URL ||
    process.env.DATADOG_AGENT_URL ||
    'http://localhost:8126',
})

const traceEvent = (ponder, eventName: string, eventHandler) => {
  const span = tracer.startSpan(eventName)

  const handlerWithLog = ({ event, context }) => {
    span.setTag('chain', context.chain)
    span.setTag('args', event.arg)
    span.setTag('log', event.log)
    span.setTag('transaction', event.transaction)
    console.log(eventHandler)
    return eventHandler({ context, event })
  }

  ponder.on(eventName, handlerWithLog)
  span.finish()
}

export { tracer, traceEvent }
