import { expect } from 'chai'
import { ethers, zksyncEthers } from 'hardhat'
import { finalizeZksyncWithdrawal } from '@relay-protocol/helpers'
import { getBalance, getEvent } from '@relay-protocol/helpers'
import { JsonRpcSigner, ZeroAddress } from 'ethers'

// withdraw native eth
// https://era.zksync.network/tx/0x44ee1a78cded74543cae05e70dd936043bbae441ec2c7f968af4a6e888ccb07f
const account = '0x246A13358Fb27523642D86367a51C2aEB137Ac6C'
const amount = 100000000000000n
const withdrawalHash =
  '0x44ee1a78cded74543cae05e70dd936043bbae441ec2c7f968af4a6e888ccb07f'

describe('ZkSync withdrawal finalization', () => {
  it('should work with native tokens', async () => {
    // const [signer] = await ethers.getSigners()
    const [signer] = zksyncEthers.getSigners()

    const balanceBefore = await getBalance(
      account,
      ZeroAddress,
      ethers.provider
    )
    await signer
      .finalizeWithdrawal(withdrawalHash)
      // const tx = await finalizeZksyncWithdrawal(signer, withdrawalHash)
      // const receipt = await tx.wait()

      .expect(await getBalance(account, ZeroAddress, ethers.provider))
      .to.equal(balanceBefore + amount)
  })

  it.skip('should work with ERC20 tokens', async () => {})
})
