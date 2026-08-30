import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@nomicfoundation/hardhat-ignition-ethers'

// the  '@matterlabs/hardhat-zksync' is not compatible with hardhat 2.26.1
// and will throw "Error HH209 : Redefinition of task verify:etherscan failed" when used
// so we import libs individually
import '@matterlabs/hardhat-zksync-deploy'
import '@matterlabs/hardhat-zksync-solc'
import '@matterlabs/hardhat-zksync-node'
import '@matterlabs/hardhat-zksync-ethers'
import '@matterlabs/hardhat-zksync-verify'

import { networks as nets } from '@relay-vaults/networks'
import registry from '@hyperlane-xyz/registry'
import 'solidity-docgen'

// Interaction tasks
import './tasks/pool'
import './tasks/bridge'
import './tasks/origins/add'

// Actual contracts
import './tasks/deploy/pool'
import './tasks/deploy/relay-bridge'
import './tasks/deploy/bridge-proxy'
import './tasks/deploy/relay-pool-factory'
import './tasks/deploy/relay-bridge-factory'
import './tasks/deploy/verify'
import './tasks/deploy/timelock'
import './tasks/deploy/set-earliest-block'
import './tasks/deploy/origin-curator'

// Helpers/tests
import './tasks/networks'
import './tasks/deploy/native-gateway'
import './tasks/deploy/dummy-yield-pool'
import './tasks/utils/exportAbis'
import './tasks/utils/zksync-contracts.ts'
import './tasks/utils/collect-morpho.ts'

// get pk from shell
const { DEPLOYER_PRIVATE_KEY } = process.env
if (!DEPLOYER_PRIVATE_KEY) {
  console.error(
    '⚠️ Missing DEPLOYER_PRIVATE_KEY environment variable. Please set one. In the meantime, we will use default settings'
  )
} else {
  console.error(
    '⚠️ Using account from DEPLOYER_PRIVATE_KEY environment variable.'
  )
}

// parse networks from file
const networks = { hardhat: {} }
Object.keys(nets).forEach((id) => {
  const { slug, rpc, isTestnet, stack } = nets[id]
  let accounts
  let zksync = {}
  const network = {
    chainId: Number(id),
    url: rpc[0],
  }
  if (DEPLOYER_PRIVATE_KEY) {
    accounts = [DEPLOYER_PRIVATE_KEY]
  }
  if (stack === 'zksync') {
    zksync = {
      ethNetwork: isTestnet ? 'sepolia' : 'mainnet',
      zksync: true,
    }
  }
  networks[slug] = {
    ...network,
    accounts,
    ...zksync,
  }
})

// parse fork URL for tests
const forkUrl = process.env.RPC_URL
if (forkUrl) {
  // check if fork is zksync
  const isZKsync = !!process.env.ZKSYNC
  networks.hardhat = {
    forking: {
      url: forkUrl,
    },
    zksync: isZKsync,
  }
}

const explorerApiKey = (network: string): string =>
  process.env[`EXPLORER_API_KEY_${network.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}`] ??
  'default-api-key'

const etherscan = {
  apiKey: {
    abstract: explorerApiKey('abstract'),
    arbitrum: explorerApiKey('arbitrum'),
    arbitrumSepolia: explorerApiKey('arbitrum_sepolia'),
    avalanche: explorerApiKey('avalanche'),
    base: explorerApiKey('base'),
    baseSepolia: explorerApiKey('base_sepolia'),
    bsc: explorerApiKey('bsc'),
    ethereum: explorerApiKey('ethereum'),
    'ethereum sepolia': explorerApiKey('ethereum_sepolia'),
    gnosis: explorerApiKey('gnosis'),
    mainnet: explorerApiKey('mainnet'),
    optimisticEthereum: explorerApiKey('optimistic_ethereum'),
    polygon: explorerApiKey('polygon'),
    polygonZkEVM: explorerApiKey('polygon_zk_evm'),
    rari: explorerApiKey('rari'),
    sepolia: explorerApiKey('sepolia'),
    swellchain: explorerApiKey('swellchain'),
    xdai: explorerApiKey('xdai'),
    zora: explorerApiKey('zora'),
  },
  customChains: [],
}

Object.values(registry).forEach((v) => {
  // prevent overriding chains declared in customChains array
  const customChain = etherscan.customChains.find(
    ({ chainId }) => chainId === v.chainId
  )
  if (nets[v.chainId] && !customChain) {
    etherscan.apiKey[v.name] = etherscan.apiKey[v.name] || 'default-api-key' // placeholder for blocksncout specifically!
    etherscan.customChains.push({
      chainId: v.chainId,
      network: v.name,
      urls: {
        apiURL: v.blockExplorers[0].apiUrl.replace('/eth-rpc', ''),
        browserURL: v.blockExplorers[0].url,
      },
    })
  }
})

const config: HardhatUserConfig = {
  docgen: {
    exclude: ['interfaces', 'utils'],
    pages: 'files',
  },
  etherscan,
  networks,
  solidity: {
    compilers: [
      {
        settings: {
          optimizer: {
            details: { yul: false },
            enabled: true,
            runs: 200,
          },
        },
        version: '0.8.28',
      },
    ],
  },

  sourcify: {
    enabled: false,
  },
  zksolc: {
    settings: {
      contractsToCompile: [
        'contracts/RelayPool.sol',
        'contracts/RelayBridgeFactory.sol',
        'contracts/BridgeProxy/withdraw/ZkSyncBridgeProxy.sol',
        'contracts/interfaces/IUSDC.sol',
        'contracts/utils/tests/MyToken.sol',
      ],
      // for '<address payable>.send/transfer(<X>)'
      // contracts/RelayBridge.sol:189:5
      suppressedErrors: ['sendtransfer'],
    },
    version: '1.5.15',
  },
  zksyncAnvil: {
    version: '0.6.1',
  },
}

export default config
