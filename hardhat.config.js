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
        url: `https://mainnet.infura.io/v3/571a476709e840489f546ce9b6b5544a`,
        // blockNumber: 16867730,
      },
      allowUnlimitedContractSize: true,
    },
    goerli: {
      url: "https://goerli.infura.io/v3/571a476709e840489f546ce9b6b5544a",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 5,
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: "",
  },
};
