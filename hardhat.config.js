require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  mocha: {
    timeout: 100000000,
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 10000,
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://eth.getblock.io/7644f21a-996e-4ce3-a87e-3db911718d8f/mainnet/`,
        // blockNumber: 16867730,
      },
      allowUnlimitedContractSize: true,
    },
    goerli: {
      url: "https://eth.getblock.io/7644f21a-996e-4ce3-a87e-3db911718d8f/goerli/",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 5,
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: "3IQDCVUY55AFAMN5IPXVVCDT9WVTISN6XX",
  },
};
