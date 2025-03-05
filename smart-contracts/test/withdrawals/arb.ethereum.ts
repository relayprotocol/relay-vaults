import { ethers } from 'hardhat'
import { ZeroAddress } from 'ethers'
import { expect } from 'chai'

import { ArbitrumOrbitNativeBridgeProxy } from '../../typechain-types'
import { networks } from '@relay-protocol/networks'
import { getBalance } from '@relay-protocol/helpers'

const ETH_CHAIN_ID = 1n
const {
  bridges: {
    arb: { outbox: outboxAddress },
  },
} = networks[ETH_CHAIN_ID.toString()]

const recipientAddress = '0x246A13358Fb27523642D86367a51C2aEB137Ac6C'
const amount = 1000n

// construct the actual proof
// NB: we can not test this as constructing the proof
// require calls to the precompiled contracts on Arbitrum
// and this is not supported by hardhat
// (see 'arb/constructProof.ts' in `@relay-protocol/helpers`)
// const {
//   proof,
//   leaf,
//   caller,
//   destination,
//   arbBlockNum,
//   ethBlockNum,
//   timestamp,
//   callvalue,
//   data,
// } = await constructArbProof(
//   originTxHash,
//   ARB_CHAIN_ID,
//   1n,
//   ethers.provider as JsonRpcApiProvider
// )

describe.skip('Arbitrum Orbit withdrawal', function () {
  let bridge: ArbitrumOrbitNativeBridgeProxy

  it('works using native', async () => {
    // https://arbiscan.io/tx/0x650570bd55b1bf54cd64d8882b4cc8b58f06c475ec17fdba93f2fbfa23fca340
    // https://arbiscan.io/tx/0xbc69d0628b19ce314abf17a3e79696a155a8bb5c84a1410311c4546b9ec4631e
    // const originTxHash =
    //   '0x650570bd55b1bf54cd64d8882b4cc8b58f06c475ec17fdba93f2fbfa23fca340'
    // TODO: parse proof
    const proof = {}
    const balanceBefore = await getBalance(
      recipientAddress,
      ZeroAddress,
      ethers.provider
    )
    // do the claim
    const outbox = await ethers.getContractAt('IOutbox', outboxAddress)
    const tx = await outbox.executeTransaction(proof)

    const balanceAfter = await getBalance(
      recipientAddress,
      ZeroAddress!,
      ethers.provider
    )
    // const receipt = await tx.wait()
    expect(balanceAfter).to.equals(balanceBefore + amount)
  })

  it.skip('works with ERC20 (WETH)', async () => {})
})
