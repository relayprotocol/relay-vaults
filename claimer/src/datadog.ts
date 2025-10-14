import { StatsD } from 'hot-shots'
import { logger } from './logger'

let statsd: StatsD | null = null
const service = process.env.SERVICE_NAME || 'vaults-backend-claimer'
const environment =
  process.env.ENVIRONMENT || process.env.NODE_ENV || 'development'
const version = process.env.IMAGE_TAG || 'unknown'
const url = new URL(process.env.DATADOG_AGENT_URL || 'http://localhost:8125')

export const start = () => {
  logger.info('Starting monitoring', { environment, service, url, version })
  // init if datadog is set
  if (process.env.DATADOG_AGENT_URL) {
    statsd = new StatsD({
      globalTags: {
        environment,
        service,
        version,
      },
      host: url.hostname,
      port: parseInt(url.port || '8125', 10),
    })

    statsd.increment('vaults_claimer.heartbeat', 1)
    logger.info('Heartbeat sent to datadog')
  }
}

export const stop = async () => {
  logger.info('Stopped monitoring')
  if (statsd) {
    statsd.close()
  }
}
