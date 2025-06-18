import { RelayVaultService } from '@relay-vaults/client'

const vaultService = new RelayVaultService(
  process.env.BACKEND_URL ?? 'https://vaults-api.relay.link/'
)

export const start = async () => {
  return {
    vaultService,
  }
}

export const stop = async () => {}
