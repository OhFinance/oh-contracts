// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {IUniswapV2Router02} from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import {ILiquidator} from "../interfaces/ILiquidator.sol";
import {IRegistry} from "../interfaces/IRegistry.sol";
import {OhSubscriber} from "../registry/OhSubscriber.sol";

/// @title Oh! Finance Liquidator
/// @notice Contract to manage standard token liquidations on Uniswap or Sushiswap
contract OhLiquidator is OhSubscriber, ILiquidator {
    using SafeERC20 for IERC20;

    /// @notice mapping of source token to desired token to sushiswap liquidation route
    mapping(address => mapping(address => address[])) public sushiswapRoutes;

    /// @notice mapping of source token to desired token to uniswap liquidation route
    mapping(address => mapping(address => address[])) public uniswapRoutes;

    /// @notice mapping of source token to desired token to router used for liquidation
    mapping(address => mapping(address => address)) public tokenSwapRouter;

    /// @notice address of Sushiswap RouterV2
    address public override sushiswapRouter;

    /// @notice address of Uniswap RouterV2
    address public override uniswapRouter;

    /// @notice address of WETH
    address public override weth;

    /// @notice Initialize the Liquidator with Uniswap and Sushiswap V2 Router Addresses
    /// @param _registry The address of the Registry
    /// @param _uniswapRouter The address of the Uniswap RouterV2
    /// @param _sushiswapRouter The address of the Sushiswap RouterV2
    /// @dev Internally sets WETH address from Uniswap Router
    constructor(
        address _registry,
        address _uniswapRouter,
        address _sushiswapRouter
    ) OhSubscriber(_registry) {
        sushiswapRouter = _sushiswapRouter;
        uniswapRouter = _uniswapRouter;
        weth = IUniswapV2Router02(_uniswapRouter).WETH();
    }

    /// @notice Liquidate an amount of 'from' tokens to 'to' tokens from this address
    /// @dev Send proceeds to the caller, `msg.sender` will typically be a Strategy
    /// @param recipient The recipient of the swap
    /// @param from The token we have
    /// @param to The token we want to swap to
    /// @param amount The amount of 'from' tokens to swap
    /// @param minOut The minimum output amount accepted
    /// @return The amount of 'to' tokens received
    function liquidate(
        address recipient,
        address from,
        address to,
        uint256 amount,
        uint256 minOut
    ) external override returns (uint256) {
        // get the router address and swap path
        address router = tokenSwapRouter[from][to];
        address[] memory path = router == uniswapRouter ? uniswapRoutes[from][to] : sushiswapRoutes[from][to];

        // increase allowance and swap
        IERC20(from).safeIncreaseAllowance(router, amount);
        uint256[] memory output = IUniswapV2Router02(router).swapExactTokensForTokens(amount, minOut, path, recipient, block.timestamp);

        // return amount received
        return output[path.length - 1];
    }

    /// @notice Set liquidation route for a token pair on Uniswap
    /// @param from The token that we have
    /// @param to The token that we want
    /// @param path The swap path used to get the desired token
    function setUniswapRoutes(
        address from,
        address to,
        address[] memory path
    ) external onlyGovernance {
        uint256 length = path.length;

        require(from == path[0], "Liquidator: Invalid From");
        require(to == path[length - 1], "Liquidator: Invalid To");

        uniswapRoutes[from][to] = path;
        tokenSwapRouter[from][to] = uniswapRouter;
    }

    /// @notice Set liquidation route for a token pair on Sushiswap
    /// @param from The token that we have
    /// @param to The token that we want
    /// @param path The swap path used to get the desired token
    function setSushiswapRoutes(
        address from,
        address to,
        address[] memory path
    ) external onlyGovernance {
        uint256 length = path.length;

        require(from == path[0], "SetSushiRoutes: Invalid From");
        require(to == path[length - 1], "SetSushiRoutes: Invalid To");

        sushiswapRoutes[from][to] = path;
        tokenSwapRouter[from][to] = sushiswapRouter;
    }

    /// @notice Get the router and swap path for a token pair
    /// @param from The token that we have
    /// @param to The token that we want
    function getSwapInfo(address from, address to) external view override returns (address router, address[] memory path) {
        if (tokenSwapRouter[from][to] == uniswapRouter) {
            router = uniswapRouter;
            path = uniswapRoutes[from][to];
        } else if (tokenSwapRouter[from][to] == sushiswapRouter) {
            router = sushiswapRouter;
            path = sushiswapRoutes[from][to];
        }
    }
}
