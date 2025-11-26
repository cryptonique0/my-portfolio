require("dotenv").config();
require("@nomiclabs/hardhat-ethers");

const { CELO_RPC, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: {
    compilers: [{ version: "0.8.0" }],
  },
  networks: {
    alfajores: {
      url: CELO_RPC || "https://alfajores-forno.celo-testnet.org",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};
