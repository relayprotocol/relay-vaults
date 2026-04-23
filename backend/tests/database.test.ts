import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/utils/aws.js', () => ({
  getIamToken: vi.fn(async () => 'iam-token'),
}))

const {
  buildDatabaseConfig,
  getSslConfig,
  parseDatabaseUrl,
  prepareDatabaseEnvForPonder,
  shouldUseIamDatabaseConfig,
} = await import('../src/utils/database.js')
const { getIamToken } = await import('../src/utils/aws.js')
const originalDatabaseUrl = process.env.DATABASE_URL
const originalDatabasePrivateUrl = process.env.DATABASE_PRIVATE_URL

describe('buildDatabaseConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.DATABASE_URL = originalDatabaseUrl
    process.env.DATABASE_PRIVATE_URL = originalDatabasePrivateUrl
  })

  it('keeps the connection string path when the database url already has a password', () => {
    expect(
      buildDatabaseConfig({
        awsRegion: 'us-east-1',
        databaseUrl: 'postgresql://relay:static-password@db.example.com/app',
      })
    ).toEqual({
      connectionString: 'postgresql://relay:static-password@db.example.com/app',
    })
  })

  it('builds a discrete IAM pool config when the database url has no password', async () => {
    const config = buildDatabaseConfig({
      awsRegion: 'us-east-1',
      databaseUrl: 'postgresql://relay@db.example.com:5433/app?sslmode=require',
    })

    expect(config).toEqual({
      poolConfig: {
        database: 'app',
        host: 'db.example.com',
        password: expect.any(Function),
        port: 5433,
        ssl: true,
        user: 'relay',
      },
    })
    await expect(config.poolConfig?.password()).resolves.toBe('iam-token')
    expect(getIamToken).toHaveBeenCalledWith({
      hostname: 'db.example.com',
      port: 5433,
      region: 'us-east-1',
      username: 'relay',
    })
  })

  it('caches the IAM token', async () => {
    const config = buildDatabaseConfig({
      awsRegion: 'us-east-1',
      databaseUrl: 'postgresql://relay@db.example.com:5433/app?sslmode=require',
    })

    await expect(config.poolConfig?.password()).resolves.toBe('iam-token')
    await expect(config.poolConfig?.password()).resolves.toBe('iam-token')

    expect(getIamToken).toHaveBeenCalledTimes(1)
  })

  it('supports sslmode=no-verify', () => {
    expect(getSslConfig('no-verify')).toEqual({
      rejectUnauthorized: false,
    })
  })

  it('identifies when the IAM config path should be used', () => {
    expect(
      shouldUseIamDatabaseConfig(
        'postgresql://relay@db.example.com:5433/app?sslmode=require'
      )
    ).toBe(true)
    expect(
      shouldUseIamDatabaseConfig(
        'postgresql://relay:static-password@db.example.com:5433/app'
      )
    ).toBe(false)
  })

  it('clears database env vars for the IAM path so ponder cannot inject a connection string', () => {
    process.env.DATABASE_URL =
      'postgresql://relay@db.example.com:5433/app?sslmode=require'
    process.env.DATABASE_PRIVATE_URL =
      'postgresql://relay@private-db.example.com:5433/app?sslmode=require'

    prepareDatabaseEnvForPonder(process.env.DATABASE_URL)

    expect(process.env.DATABASE_URL).toBeUndefined()
    expect(process.env.DATABASE_PRIVATE_URL).toBeUndefined()
  })

  it('parses the database url into discrete pg fields', () => {
    expect(
      parseDatabaseUrl(
        'postgresql://relay:static-password@db.example.com:5433/app?sslmode=require'
      )
    ).toEqual({
      database: 'app',
      host: 'db.example.com',
      password: 'static-password',
      port: 5433,
      user: 'relay',
    })
  })
})
