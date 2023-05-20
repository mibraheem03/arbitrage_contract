# About The Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:
## How to deploy

Rename the .env.template file to .env file
Add your wallet Private Key

### Change goerli to mainnet for mainnet deployment
```
npx hardhat run scripts/deploy.js --network goerli
```
## How to verify Contract

```    
npx hardhat verify --network goerli <deployedContractAddress> <aaveLendingAddress>
```