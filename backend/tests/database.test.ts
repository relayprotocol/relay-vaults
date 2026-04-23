import { describe, expect, it, vi } from 'vitest'

vi.mock('../src/utils/aws.js', () => ({
  getIamToken: vi.fn(async () => 'iam-token'),
}))

const { buildDatabasePoolConfig, getSslConfigFromEnv } = await import(
  '../src/utils/database.js'
)
const { getIamToken } = await import('../src/utils/aws.js')
const originalSslMode = process.env.PGSSLMODE

describe('buildDatabasePoolConfig', () => {

  it('returns undefined when the database url already has a password', () => {
    expect(
      buildDatabasePoolConfig({
        awsRegion: 'us-east-1',
        databaseUrl: 'postgresql://relay:static-password@db.example.com/app',
      })
    ).toBeUndefined()
  })

  it('adds IAM auth with ssl when PGSSLMODE requires it', async () => {
    process.env.PGSSLMODE = 'require'

    const poolConfig = buildDatabasePoolConfig({
      awsRegion: 'us-east-1',
      databaseUrl: 'postgresql://relay@db.example.com:5433/app',
    })

    expect(poolConfig).toBeDefined()
    expect(poolConfig?.ssl).toBe(true)
    await expect(poolConfig?.password()).resolves.toBe('iam-token')
    expect(getIamToken).toHaveBeenCalledWith({
      hostname: 'db.example.com',
      port: 5433,
      region: 'us-east-1',
      username: 'relay',
    })
  })

  it('supports PGSSLMODE=no-verify', () => {
    expect(getSslConfigFromEnv('no-verify')).toEqual({
      rejectUnauthorized: false,
    })
  })

  it('does not force ssl when PGSSLMODE is unset', () => {
    delete process.env.PGSSLMODE

    const poolConfig = buildDatabasePoolConfig({
      awsRegion: 'us-east-1',
      databaseUrl: 'postgresql://relay@db.example.com/app',
    })

    expect(poolConfig).toBeDefined()
    expect(poolConfig?.ssl).toBeUndefined()
  })
})

process.env.PGSSLMODE = originalSslMode
