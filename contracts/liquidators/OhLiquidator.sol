// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {
    IUniswapV2Router02
} from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import {ILiquidator} from "../interfaces/ILiquidator.sol";
import {IRegistry} from "../interfaces/IRegistry.sol";
import {OhSubscriber} from "../registry/OhSubscriber.sol";

/// @title Oh! Finance Liquidator
/// @notice Contract to manage standard token liquidations on Uniswap or Sushiswap
contract OhLiquidator is ILiquidator, OhSubscriber {
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

    constructor(
        address _registry,
        address _uniswapRouter,
        address _sushiswapRouter
    ) OhSubscriber(_registry) {
        sushiswapRouter = _sushiswapRouter;
        uniswapRouter = _uniswapRouter;
        weth = IUniswapV2Router02(_uniswapRouter).WETH();
    }

    function liquidate(
        address from,
        address to,
        uint256 amount
    ) external override {
        // require(IRegistry(registry).strategies(msg.sender), "Liquidator: Not Approved");
        IERC20(from).safeTransferFrom(msg.sender, address(this), amount);

        address router = tokenSwapRouter[from][to];
        address[] memory path =
            router == uniswapRouter ? uniswapRoutes[from][to] : sushiswapRoutes[from][to];

        IERC20(from).safeIncreaseAllowance(router, amount);
        IUniswapV2Router02(router).swapExactTokensForTokens(
            amount,
            1,
            path,
            address(this), // ???
            block.timestamp
        );
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

        require(from == path[0], "SetUniswapRoutes: Invalid From");
        require(to == path[length - 1], "SetUniswapRoutes: Invalid To");

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
    function getSwapInfo(address from, address to)
        external
        view
        override
        returns (address router, address[] memory path)
    {
        if (tokenSwapRouter[from][to] == uniswapRouter) {
            router = uniswapRouter;
            path = uniswapRoutes[from][to];
        } else if (tokenSwapRouter[from][to] == sushiswapRouter) {
            router = sushiswapRouter;
            path = sushiswapRoutes[from][to];
        }
    }
}
