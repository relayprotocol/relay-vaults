import { RelayVaultService } from '@relay-vaults/client'

const vaultService = new RelayVaultService(
  process.env.BACKEND_URL ?? 'https://vaults-api.relay.link/'
)
import * as monitoring from './datadog.js'

export const start = async () => {
  monitoring.start()
  return {
    vaultService,
  }
}

export const stop = async () => {
  monitoring.stop()
}
