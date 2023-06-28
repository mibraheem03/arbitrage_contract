// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { ethers, upgrades } = require("hardhat");

async function main() {
  const aaveLendingAddress = "0x5E52dEc931FFb32f609681B8438A51c675cc232d";
  const Arbitrage = await hre.ethers.getContractFactory("Arbitrage");
  // const ArbitrageContract = await upgrades.deployProxy(Arbitrage, [aaveLendingAddress], { initializer: "initialize" });
  const ArbitrageContract = await Arbitrage.deploy(aaveLendingAddress, { gasLimit: 5000000 });
  await ArbitrageContract.deployed();

  console.log(`Arbitrage Contract deployed to ${ArbitrageContract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
