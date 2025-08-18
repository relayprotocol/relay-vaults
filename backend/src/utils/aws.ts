import { Signer } from '@aws-sdk/rds-signer'
import { fromNodeProviderChain } from '@aws-sdk/credential-providers'

interface GetIamTokenParams {
  hostname: string
  port?: number
  username: string
  region?: string
}

export const getIamToken = async ({
  hostname,
  port = 5432,
  username,
  region = 'us-east-1',
}: GetIamTokenParams) => {
  const signer = new Signer({
    credentials: fromNodeProviderChain(),
    hostname,
    port,
    region,
    username,
  })

  return signer.getAuthToken()
}
