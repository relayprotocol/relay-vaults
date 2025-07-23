import tracer from 'dd-trace'

// init if datadog is set
if (process.env.DATADOG_AGENT_URL) {
  const SERVICE_NAME = process.env.SERVICE_NAME || 'vaults-backend-claimer'
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
}

tracer.use('winston')

// simple dd metric to track if claimer is up
const heartbeat = () => {
  if (process.env.DATADOG_AGENT_URL) {
    const span = tracer.startSpan('vaults-claimer.heartbeat')
    span.finish()
  }
}

export { heartbeat }
