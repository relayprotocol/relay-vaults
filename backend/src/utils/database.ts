import { getIamToken } from './aws.js'

type SslConfig = true | { rejectUnauthorized: false }

type BuildDatabasePoolConfigParams = {
  awsRegion?: string
  databaseUrl: string
}

export const getSslConfigFromEnv = (
  sslMode = process.env.PGSSLMODE
): SslConfig | undefined => {
  switch (sslMode) {
    case 'prefer':
    case 'require':
    case 'verify-ca':
    case 'verify-full':
      return true
    case 'no-verify':
      return { rejectUnauthorized: false }
    default:
      return undefined
  }
}

export const buildDatabasePoolConfig = ({
  awsRegion,
  databaseUrl,
}: BuildDatabasePoolConfigParams) => {
  const parsedDatabaseUrl = new URL(databaseUrl)

  if (parsedDatabaseUrl.password !== '') {
    return undefined
  }

  const ssl = getSslConfigFromEnv()

  return {
    ...(ssl ? { ssl } : {}),
    password: async () =>
      getIamToken({
        hostname: parsedDatabaseUrl.hostname,
        port: parsedDatabaseUrl.port ? Number(parsedDatabaseUrl.port) : 5432,
        region: awsRegion,
        username: parsedDatabaseUrl.username,
      }),
  }
}
