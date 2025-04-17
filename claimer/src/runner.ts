import { RelayVaultService } from '@relay-protocol/client'

const vaultService = new RelayVaultService(
  process.env.BACKEND_URL ??
    'https://relay-protocol-production-2dce.up.railway.app/'
)

export const start = async () => {
  return {
    vaultService,
  }
}

export const stop = async () => {}
