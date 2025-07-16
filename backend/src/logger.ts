import { createLogger, format, transports } from 'winston'

const SERVICE_NAME = process.env.SERVICE_NAME || 'vaults-backend'
const ENVIRONMENT =
  process.env.ENVIRONMENT || process.env.NODE_ENV || 'development'

export const logger = createLogger({
  format: format.json(),
  level: 'info',
  transports: [new transports.Console()],
})

const logEvent = (ponder, eventName: string, eventHandler) => {
  const handlerWithLog = ({ event, context }) => {
    logger.info(eventName, {
      args: event.args,
      chain: context.chain,
      env: ENVIRONMENT,
      environment: ENVIRONMENT,
      eventName,
      msg: eventName,
      rawLog: event.log,
      service: SERVICE_NAME,
      timestamp: event.block.timestamp,
      transactionHash: event.transaction ? event.transaction?.hash : null,
      version: process.env.IMAGE_TAG || 'unknown',
    })
    return eventHandler({ context, event })
  }

  ponder.on(eventName, handlerWithLog)
}

export { logEvent }
