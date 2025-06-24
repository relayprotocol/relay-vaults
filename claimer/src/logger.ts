import { createLogger, format, transports } from 'winston'

export const logger = createLogger({
  defaultMeta: { service: 'vaults-claimer' },
  format: format.json(),
  level: 'info',
  transports: [
    new transports.File({
      filename: 'vaults-claimer-error.log',
      level: 'error',
    }),
    new transports.File({ filename: 'vaults-claimer-combined.log' }),
  ],
})

// also node to console if we are not in prod
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  )
}
