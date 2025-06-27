import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createRpcConfig } from './utils'

describe('utils/createRpcConfig', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    // Make a copy of the environment to avoid test contamination
    process.env = { ...OLD_ENV, RPC_1: 'https://my.rpc/ethereum' }
  })

  afterEach(() => {
    // Restore original environment
    process.env = OLD_ENV
  })

  it('should return true for valid URLs using the env vars', () => {
    expect(createRpcConfig(1)).toEqual(['https://my.rpc/ethereum'])
  })

  it('should prioritize environment variables over default URLs', () => {
    const defaultUrls = ['https://default.rpc/ethereum']
    const urls = createRpcConfig(1, defaultUrls)
    expect(urls).toEqual([
      'https://my.rpc/ethereum',
      'https://default.rpc/ethereum',
    ])
  })
})
