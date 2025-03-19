import fs from 'fs-extra'
import path from 'path'
import { getProvider } from '@relay-protocol/helpers'

interface Addresses {
  [address: string]: any
}

const addresses: Addresses = {}

const basePath = __dirname + '/../../../smart-contracts/ignition/deployments/'
export const getAddressForFile = (file: string, contractName: string) => {
  const deployments = JSON.parse(fs.readFileSync(basePath + file, 'utf-8'))
  return deployments[contractName]
}

// export const getDeployBlock = async (address, chainID) => {}

export const getAddresses = () => {
  fs.readdirSync(basePath).forEach((file) => {
    let match
    if ((match = file.match(/RelayBridgeFactory-(?<chainId>.*)/))) {
      addresses[match.groups!.chainId] ||= {}
      const address = getAddressForFile(
        file + '/deployed_addresses.json',
        'RelayBridgeFactory#RelayBridgeFactory'
      )
      if (address) {
        addresses[match.groups!.chainId].RelayBridgeFactory = address
      }
    } else if ((match = file.match(/RelayPoolFactory-(?<chainId>.*)/))) {
      addresses[match.groups!.chainId] ||= {}
      const address = getAddressForFile(
        file + '/deployed_addresses.json',
        'RelayPoolFactory#RelayPoolFactory'
      )
      if (address) {
        addresses[match.groups!.chainId].RelayPoolFactory = address
      }
    }
  })
  return addresses
}

const generateAddressFile = async () => {
  const addresses = getAddresses()
  const abiFileName = path.resolve('src', 'addresses.json')
  await fs.outputJSON(abiFileName, addresses, { spaces: 2 })
}

generateAddressFile()
