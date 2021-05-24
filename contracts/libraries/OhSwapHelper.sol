// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

library OhSwapHelper {
    using SafeERC20 for IERC20;

    // swap tokens on any IUniswapV2Router02 compatible protocol
    // perform balance check to ensure trade was successful
    function swap(
        address router,
        address token,
        uint256 amount,
        address[] memory routes
    ) internal {
        uint256 balanceBefore = IERC20(token).balanceOf(address(this));

        IERC20(token).safeApprove(router, 0);
        IERC20(token).safeApprove(router, amount);
        IUniswapV2Router02(router).swapExactTokensForTokens(
            amount,
            0,
            routes,
            address(this),
            block.timestamp
        );

        uint256 balanceAfter = IERC20(token).balanceOf(address(this));
        require(balanceAfter > balanceBefore, "SwapHelper: Swap failed");
    }
}
