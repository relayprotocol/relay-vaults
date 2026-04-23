import { getIamToken } from './aws.js'

type SslConfig = true | { rejectUnauthorized: false }

type DatabaseUrlParts = {
  database: string
  host: string
  password: string
  port: number
  user: string
}

type BuildDatabaseConfigParams = {
  awsRegion?: string
  databaseUrl: string
}

const TOKEN_CACHE_TTL_MS = 10 * 60 * 1000

export const getSslConfig = (
  sslMode?: string | null
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

export const parseDatabaseUrl = (databaseUrl: string): DatabaseUrlParts => {
  const parsedDatabaseUrl = new URL(databaseUrl)

  return {
    database: parsedDatabaseUrl.pathname.replace(/^\//, ''),
    host: parsedDatabaseUrl.hostname,
    password: parsedDatabaseUrl.password,
    port: parsedDatabaseUrl.port ? Number(parsedDatabaseUrl.port) : 5432,
    user: parsedDatabaseUrl.username,
  }
}

const getSslConfigForDatabaseUrl = (databaseUrl: string) => {
  const parsedDatabaseUrl = new URL(databaseUrl)

  return (
    getSslConfig(parsedDatabaseUrl.searchParams.get('sslmode')) ??
    getSslConfig(process.env.PGSSLMODE)
  )
}

export const buildDatabaseConfig = ({
  awsRegion,
  databaseUrl,
}: BuildDatabaseConfigParams) => {
  const parsedDatabaseUrl = parseDatabaseUrl(databaseUrl)
  const ssl = getSslConfigForDatabaseUrl(databaseUrl)

  if (parsedDatabaseUrl.password !== '') {
    return {
      connectionString: databaseUrl,
    }
  }

  let cachedToken: string | null = null
  let cachedAt = 0

  return {
    poolConfig: {
      database: parsedDatabaseUrl.database,
      host: parsedDatabaseUrl.host,
      password: async () => {
        const now = Date.now()

        if (cachedToken && now - cachedAt < TOKEN_CACHE_TTL_MS) {
          return cachedToken
        }

        cachedToken = await getIamToken({
          hostname: parsedDatabaseUrl.host,
          port: parsedDatabaseUrl.port,
          region: awsRegion,
          username: parsedDatabaseUrl.user,
        })
        cachedAt = now

        return cachedToken
      },
      port: parsedDatabaseUrl.port,
      ...(ssl ? { ssl } : {}),
      user: parsedDatabaseUrl.user,
    },
  }
}
