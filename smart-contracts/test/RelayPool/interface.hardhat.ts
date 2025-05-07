import { expect } from 'chai'
import { ethers } from 'hardhat'
import { Interface, ZeroAddress } from 'ethers'

const parseInterface = (iface: Interface, filter = 'function') => {
  const parsed = new ethers.Interface(
    Object.values(iface.fragments.filter(({ type }) => type === filter))
  )
  return parsed.format(true)
}

// find any missing entries
const compareInterfaces = (
  iface1: Interface,
  iface2: Interface,
  filter = 'function'
) => {
  const i1 = parseInterface(iface1, filter)
  const i2 = parseInterface(iface2, filter)
  const missing = i1.filter((entry) => !i2.includes(entry))
  const remaining = i2.filter((entry) => !i1.includes(entry))

  // same numbers of elements
  console.log({
    filter,
    i1: i1.length,
    i2: i2.length,
    missing,
    remaining,
  })
  expect(i1.length).to.equal(i2.length)

  // elements are identical
  expect(
    missing.length + remaining.length,
    `\n${missing.length + remaining.length} errors.
---
${missing.length ? `Missing in interface:\n${missing.join('\n')}` : ''}.
---
${remaining.length ? `Missing in contract:\n${remaining.join('\n')}` : ''}`
  ).to.equal(0)
}

describe('RelayPool / interface', () => {
  let relayPoolContract: Interface
  let relayPoolInterface: Interface

  before(async () => {
    ;({ interface: relayPoolContract } = await ethers.getContractFactory(
      'contracts/RelayPool.sol:RelayPool'
    ))
    ;({ interface: relayPoolInterface } = await ethers.getContractAt(
      'contracts/interfaces/IRelayPool.sol:IRelayPool',
      ZeroAddress
    ))
  })

  it('includes all public functions', async () => {
    compareInterfaces(relayPoolContract, relayPoolInterface)
  })
  it('includes all events', async () => {
    compareInterfaces(relayPoolContract, relayPoolInterface, 'event')
  })
  it('includes all structs', async () => {
    compareInterfaces(relayPoolContract, relayPoolInterface, 'struct')
  })
  it('includes all errors', async () => {
    compareInterfaces(relayPoolContract, relayPoolInterface, 'error')
  })
})
