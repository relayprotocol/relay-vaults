import tracer from 'dd-trace'

// init if datadog is set
if (process.env.DATADOG_AGENT_URL) {
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

  // send winston logs to dd
  tracer.use('winston')
}
