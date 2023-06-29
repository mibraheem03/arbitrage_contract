const hre = require("hardhat");
const { ethers, upgrades } = require("hardhat");
const ArbitrageContractABI = require("./abis/ArbitrageContract.json");
const IERC20ABI = require("./abis/IERC20.json");

(async () => {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://goerli.infura.io/v3/571a476709e840489f546ce9b6b5544a"
  );
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const ArbitrageContractAddress = "0x62be37Cde62097E6DEE98aC7CC4f7d72Dd0748E1"; // Your Contract Address
  const ArbitrageContract = await ethers.getContractAt(
    ArbitrageContractABI,
    ArbitrageContractAddress
  );
  const borrowAsset = "0x65aFADD39029741B3b8f0756952C74678c9cEC93"; // Token You have to borrow -- Currently its USDT
  const amountToBorrow = "1000000"; //Amount to Borrow, Keep the decimal value in Check
  const amount2 = "1000000"; // This Amount will be for your calculation, how much you want to buy
  const uniswapv2Path = [
    "0x2E8D98fd126a32362F2Bd8aA427E59a1ec63F780",
    "0x65aFADD39029741B3b8f0756952C74678c9cEC93",
  ];
  const uniswapv3Path = getPath(uniswapv2Path, "500");
  const side = "uniswapv3";

  const tnx = await ArbitrageContract.connect(
    wallet
  ).callStatic.arbitrageLogic(
    borrowAsset,
    amountToBorrow,
    amount2,
    uniswapv3Path,
    uniswapv2Path.reverse(),
    side
  );
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
