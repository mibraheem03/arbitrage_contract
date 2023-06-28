const hre = require("hardhat");
const { ethers, upgrades } = require("hardhat");
const ArbitrageContractABI = require("./abis/ArbitrageContract.json");
const IERC20ABI = require("./abis/IERC20.json");

(async () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.NODE);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const ArbitrageContractAddress = "0x604EA43AbB42f71C1DD356E008c2C44bAC3c8835"; // Your Contract Address
  const ArbitrageContract = await ethers.getContractAt(ArbitrageContractABI, ArbitrageContractAddress);
  const borrowAsset = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // Token You have to borrow -- Currently its USDT
  const amountToBorrow = "1000000000"; //Amount to Borrow, Keep the decimal value in Check
  const amount2 = "1000000000"; // This Amount will be for your calculation, how much you want to buy
  const uniswapv2Path = ["0xdAC17F958D2ee523a2206206994597C13D831ec7", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"];
  const uniswapv3Path = getPath(uniswapv2Path, "3000");
  const side = "uniswapv3";

  const tnx = await ArbitrageContract.connect(wallet).populateTransaction.arbitrageLogic(borrowAsset, amountToBorrow, amount2, uniswapv3Path, uniswapv2Path.reverse(), side);
  const response = await wallet.sendTransaction(tnx);
  const reciept = await response.wait();
})();
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
