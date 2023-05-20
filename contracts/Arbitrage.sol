// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import {FlashLoanReceiverBase} from "./FlashLoan/FlashLoanReceiverBase.sol";
import {ILendingPool, ILendingPoolAddressesProvider, IERC20} from "./FlashLoan/Interfaces.sol";
import {SafeMath} from "./FlashLoan/Libraries.sol";
import {TransferHelper} from "./FlashLoan/Interfaces.sol";

import "./ISwapRouter.sol";
import "./IUniswapV2Router.sol";

contract Arbitrage is FlashLoanReceiverBase {
    using SafeMath for uint256;
    address constant swapRouterAddressV2 =
        0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45;
    address constant uniswapRouterV2 =
        address(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
    ILendingPool LendingPoolContract =
        ILendingPool(address(0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9));

    uint256 amount;
    bytes uniswav3Path;
    address[] uniswapv2Path;
    string side;

    constructor(
        ILendingPoolAddressesProvider _addressProvider
    ) public FlashLoanReceiverBase(_addressProvider) {}

    /**
     * @dev Users can invoke this function Get FlashLoan.
     * @param asset The address of the asset to be flashBorrowed
     * @param amount The amount to be flashBorrowed
     **/
    function FlashLoanCall(address asset, uint256 amount) internal {
        address receiverAddress = address(this);

        address[] memory assets = new address[](1);
        assets[0] = asset;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;
        // 0 = no debt, 1 = stable, 2 = variable
        uint256[] memory modes = new uint256[](1);
        modes[0] = 0;

        address onBehalfOf = address(this);
        bytes memory params = "";
        uint16 referralCode = 0;
        LENDING_POOL.flashLoan(
            receiverAddress,
            assets,
            amounts,
            modes,
            onBehalfOf,
            params,
            referralCode
        );
    }

    /**
     * @dev Function to liquidate a non-healthy position collateral-wise, with Health Factor below 1 - The caller (liquidator) covers `debtToCover` amount of debt of the user getting liquidated, and receives a proportionally amount of the `collateralAsset` plus a bonus to cover market risk
     * @param _amount The debt amount of borrowed `asset` the liquidator wants to cover
     * @param _uniswap3Path Pool Fee of the Uniswap V3 Pool to convert Collateral to Borrow Token to Repay flashBorrowed Amount
     * @param _uniswapv2Path The address of the underlying asset used as collateral, to receive as result of the liquidation
     * @param _side The address of the underlying borrowed asset to be repaid with the liquidation
     **/
    function arbitrageLogic(
        address _assetToBorrow,
        uint256 _amountToBorrow,
        uint256 _amount,
        bytes memory _uniswap3Path,
        address[] memory _uniswapv2Path,
        string memory _side
    ) external {
        amount = _amount;
        uniswav3Path = _uniswap3Path;
        uniswapv2Path = _uniswapv2Path;
        side = _side;
        FlashLoanCall(_assetToBorrow, _amountToBorrow);
    }

    /**
        This function is called after your contract has received the flash loaned amount
     */
    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        if (
            keccak256(abi.encodePacked((side))) ==
            keccak256(abi.encodePacked(("uniswapv3")))
        ) {
            // Swap on Uniswapv2 First

            ISwapRouter routerv3 = ISwapRouter(swapRouterAddressV2);
            IUniswapV2Router02 routerv2 = IUniswapV2Router02(uniswapRouterV2);
            address usdt = uniswapv2Path[0];
            address usdc = uniswapv2Path[1];

            uint24 poolfee = 3000;
            bytes memory _path = abi.encodePacked(usdc, poolfee, usdt);

            TransferHelper.safeApprove(usdc, swapRouterAddressV2, amount);
            TransferHelper.safeApprove(usdt, swapRouterAddressV2, amount);

            uint256 resultswap1 = routerv3.exactInput(
                ISwapRouter.ExactInputParams({
                    path: _path,
                    recipient: address(this),
                    amountIn: amount,
                    amountOutMinimum: 0
                })
            );
            TransferHelper.safeApprove(usdc, uniswapRouterV2, amount);
            TransferHelper.safeApprove(usdt, uniswapRouterV2, amount);
            routerv2.swapExactTokensForTokens(
                resultswap1,
                0,
                uniswapv2Path,
                address(this),
                block.timestamp
            );
        } else {
            ISwapRouter routerv3 = ISwapRouter(swapRouterAddressV2);
            IUniswapV2Router02 routerv2 = IUniswapV2Router02(uniswapRouterV2);
            address usdt = uniswapv2Path[1];
            address usdc = uniswapv2Path[0];
            TransferHelper.safeApprove(usdc, swapRouterAddressV2, amount);
            TransferHelper.safeApprove(usdt, swapRouterAddressV2, amount);
            TransferHelper.safeApprove(usdc, uniswapRouterV2, amount);
            TransferHelper.safeApprove(usdt, uniswapRouterV2, amount);
            uint[] memory resultswap1 = routerv2.swapExactTokensForTokens(
                amount,
                0,
                uniswapv2Path,
                address(this),
                block.timestamp
            );

            uint resultswap2 = routerv3.exactInput(
                ISwapRouter.ExactInputParams({
                    path: uniswav3Path,
                    recipient: address(this),
                    amountIn: resultswap1[0],
                    amountOutMinimum: 0
                })
            );
        }

        // Approve the LendingPool contract allowance to *pull* the owed amount
        for (uint i = 0; i < assets.length; i++) {
            uint amountOwing = amounts[i].add(premiums[i]);
            IERC20(assets[i]).approve(
                address(LendingPoolContract),
                amountOwing
            );
        }
        return true;
    }
}
