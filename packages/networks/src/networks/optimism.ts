import { L2NetworkConfig } from '@relay-protocol/types'

export const optimism: L2NetworkConfig = {
  assets: {
    udt: '0xc709c9116dBf29Da9c25041b13a07A0e68aC5d2D',
    usdc: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    weth: '0x4200000000000000000000000000000000000006',
  },
  bridges: {
    cctp: {
      l1: {
        domain: 0n,
        messenger: '0xBd3fa81B58Ba92a82136038B25aDec7066af3155',
        transmitter: '0x0a992d191DEeC32aFe36203Ad87D7d289a738F81',
      },
      l2: {
        domain: 2n,
        messenger: '0x2B4069517957735bE00ceE0fadAE88a26365528f',
        transmitter: '0x4D41f22c5a0e5c74090899E5a8Fb597a8842b3e8',
      },
    },
    optimism: {
      l1: {
        portalProxy: '0xbEb5Fc579115071764c7423A4f12eDde41f106Ed',
      },
      l2: {
        messagePasser: '0x4200000000000000000000000000000000000016',
      },
    },
  },
  chainId: 10,
  earliestBlock: 0,
  hyperlaneMailbox: '0xd4C1905BB1D26BC93DAC913e13CaCC278CdCC80D',
  isTestnet: false,
  baseChainId: 1,
  name: 'OP Mainnet',
  rpc: process.env.RPC_10
    ? [process.env.RPC_10]
    : ['https://gateway.tenderly.co/public/optimism'],
  slug: 'op',
  stack: 'optimism',
}
