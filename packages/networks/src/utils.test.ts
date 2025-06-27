import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createRpcConfig } from './utils'

describe('utils/createRpcConfig', () => {
  const OLD_ENV = process.env
  const defaultUrls = ['https://default.rpc/ethereum']

  beforeEach(() => {
    // Make a copy of the environment to avoid test contamination
  })

  afterEach(() => {
    // Restore original environment
    process.env = OLD_ENV
  })

  it('should return URLs using the env vars', () => {
    process.env = { ...OLD_ENV, RPC_1: 'https://my.rpc/ethereum' }
    expect(createRpcConfig(1)).toEqual(['https://my.rpc/ethereum'])
  })

  it('should return default URLs', () => {
    expect(createRpcConfig(1, defaultUrls)).toEqual([
      'https://default.rpc/ethereum',
    ])
  })

  it('should prioritize environment variables over default URLs', () => {
    process.env = { ...OLD_ENV, RPC_1: 'https://my.rpc/ethereum' }
    const urls = createRpcConfig(1, defaultUrls)
    expect(urls).toEqual([
      'https://my.rpc/ethereum',
      'https://default.rpc/ethereum',
    ])
  })

  it('should handle several URLs in the environment variable', () => {
    process.env.RPC_1 = 'https://my.rpc/ethereum,https://another.rpc/ethereum'
    const urls = createRpcConfig(1, defaultUrls)
    expect(urls).toEqual([
      'https://my.rpc/ethereum',
      'https://another.rpc/ethereum',
      'https://default.rpc/ethereum',
    ])
  })
})
