const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Lock", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearLockFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const contract = await ethers.getContractFactory("Arbitrage");
    const ArbitrageContract = await contract.deploy("0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5", { gasLimit: 3000000 });

    return { ArbitrageContract, owner, otherAccount };
  }
  function getPath(tokens, fee) {
    let feeArray = fee.split(",");
    let hexfee = getFee(feeArray);
    let tokenArray = [...tokens.map((x) => x.slice(2))];
    let path = "0x";
    for (let i = 0; i < tokenArray.length; i++) {
      if (i != tokenArray.length - 1) {
        path = path + tokenArray[i].toLowerCase() + hexfee[i];
      } else {
        path = path + tokenArray[i].toLowerCase();
      }
    }
    return path;
  }

  function getFee(fee) {
    let hexFeeArray = [];
    for (let i = 0; i < fee.length; i++) {
      let hexfee = Number(fee[i]).toString(16);
      if (hexfee.length == 3) {
        hexFeeArray.push("000" + hexfee);
      } else {
        hexFeeArray.push("00" + hexfee);
      }
    }
    return hexFeeArray;
  }

  describe("Deployment", function () {
    it("Deployed Contract", async function () {
      const { ArbitrageContract } = await loadFixture(deployOneYearLockFixture);
      console.log(ArbitrageContract.address);
    });
    it("Call Flash Loan Functionality", async function () {
      const { ArbitrageContract } = await loadFixture(deployOneYearLockFixture);
      const borrowAsset = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
      const amountToBorrow = "1000000000";
      const amount2 = "1000000000";
      const uniswapv2Path = ["0xdAC17F958D2ee523a2206206994597C13D831ec7", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"];

      const uniswapv3Path = getPath(uniswapv2Path, "3000");
      const side = "uniswapv3";
      console.log(uniswapv3Path);
      await ArbitrageContract.arbitrageLogic(borrowAsset, amountToBorrow, amount2, uniswapv3Path, uniswapv2Path.reverse(), side, { gasLimit: 30000000 });
    });
  });
});
