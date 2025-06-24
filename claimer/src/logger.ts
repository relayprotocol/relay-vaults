import { createLogger, format, transports } from 'winston'

export const logger = createLogger({
  defaultMeta: { service: 'vaults-claimer' },
  format: format.json(),
  level: 'info',
  transports: [new transports.Console()],
})
