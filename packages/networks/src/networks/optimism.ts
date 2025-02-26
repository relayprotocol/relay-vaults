import { L2NetworkConfig } from '@relay-protocol/types'

export const optimism: L2NetworkConfig = {
  stack: 'op',
  l1ChainId: 1,
  chainId: 10,
  hyperlaneMailbox: '0xd4C1905BB1D26BC93DAC913e13CaCC278CdCC80D',
  isTestnet: false,
  name: 'OP Mainnet',
  slug: 'op',
  bridges: {
    op: {
      messagePasser: '0x4200000000000000000000000000000000000016',
    },
    cctp: {
      domain: 2n,
      messenger: '0x2B4069517957735bE00ceE0fadAE88a26365528f',
      transmitter: '0x4D41f22c5a0e5c74090899E5a8Fb597a8842b3e8',
    },
  },
  assets: {
    udt: '0xc709c9116dBf29Da9c25041b13a07A0e68aC5d2D',
    usdc: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    weth: '0x4200000000000000000000000000000000000006',
  },
  rpc: [process.env.RPC_10],
}
