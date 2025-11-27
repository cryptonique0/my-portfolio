require('dotenv').config()
require('@nomicfoundation/hardhat-toolbox')

const { DEPLOYER_PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env

module.exports = {
  solidity: '0.8.19',
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545'
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || process.env.RPC_URL || '',
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY || ''
    }
  }
}
