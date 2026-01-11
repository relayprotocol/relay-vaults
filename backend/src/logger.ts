import { createLogger, format, transports } from 'winston'
import { bridgeTransaction } from 'ponder:schema'
import { eq } from 'ponder'

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

// one minute in ms
const LOG_DELAY = 60_000n

export const logEvent = (ponder, eventName: string, eventHandler) => {
  const handlerWithLog = ({ event, context }) => {
    // we only want to log 'realtime' events i.e. that have been happening recently
    const isRealtime =
      event.block.timestamp * 1000n >= BigInt(new Date().getTime()) - LOG_DELAY
    if (isRealtime) {
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
      })
    }
    return eventHandler({ context, event })
  }

  ponder.on(eventName, handlerWithLog)
}
