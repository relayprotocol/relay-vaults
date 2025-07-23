import { describe, expect, it } from 'vitest'
import { chainIdFromDomainId } from '../src/hyperlane'

describe('hyperlane utils', () => {
  it('should convert domain ID to chain ID', () => {
    const domainId = 1000012617
    const chainId = chainIdFromDomainId(domainId)
    expect(chainId).toBe(1380012617)
  })
})
