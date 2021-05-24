// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface ILiquidator {
    function liquidate(
        address from,
        address to,
        uint256 amount
    ) external;

    function getSwapInfo(address from, address to)
        external
        view
        returns (address router, address[] memory path);

    function sushiswapRouter() external view returns (address);

    function uniswapRouter() external view returns (address);

    function weth() external view returns (address);
}
