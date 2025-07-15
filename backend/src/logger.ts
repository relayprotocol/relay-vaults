import { createLogger, format, transports } from 'winston'

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
      eventName,
      log: event.log,
      msg: eventName,
      timestamp: event.block.timestamp,
      transactionHash: event.transaction ? event.transaction?.hash : null,
    })
    return eventHandler({ context, event })
  }

  ponder.on(eventName, handlerWithLog)
}

export { logEvent }
