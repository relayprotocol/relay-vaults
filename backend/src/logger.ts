import { createLogger, format, transports } from 'winston'

const SERVICE_NAME = process.env.SERVICE_NAME || 'vaults-backend'

export const logger = createLogger({
  format: format.json(),
  level: 'info',
  transports: [new transports.Console()],
})

export const logError = (error: any) => {
  logger.error(error.message, {
    error,
    service: SERVICE_NAME,
    time: new Date().getTime(),
  })
}

export const logEvent = (ponder, eventName: string, eventHandler) => {
  const handlerWithLog = ({ event, context }) => {
    logger.info(eventName, {
      meta: {
        args: event.args,
        blockTimestamp: event.block.timestamp,
        chain: context.chain,
        eventName,
        rawLog: event.log,
        transactionHash: event.transaction ? event.transaction?.hash : null,
      },
      msg: eventName,
      service: SERVICE_NAME,
      time: new Date().getTime(),
      // version: process.env.IMAGE_TAG || 'unknown',
    })
    return eventHandler({ context, event })
  }

  ponder.on(eventName, handlerWithLog)
}
