import { RelayVaultService } from '@relay-protocol/client'

const vaultService = new RelayVaultService(
  (process.env.BACKEND_URL = 'http://localhost:42069/')
)

export const start = async () => {
  return {
    vaultService,
  }
}

export const stop = async () => {}
