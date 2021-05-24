// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {IBank} from "../interfaces/IBank.sol";
import {ILiquidator} from "../interfaces/ILiquidator.sol";
import {IManager} from "../interfaces/IManager.sol";
import {OhConstants} from "../libraries/OhConstants.sol";
import {OhSwapHelper} from "../libraries/OhSwapHelper.sol";
import {OhTransferHelper} from "../libraries/OhTransferHelper.sol";
import {OhSubscriberUpgradeable} from "../registry/OhSubscriberUpgradeable.sol";
import {OhStrategyStorage} from "./OhStrategyStorage.sol";

/// @title Oh! Finance Strategy
/// @notice Base Upgradeable Strategy Contract to build strategies on
abstract contract OhStrategy is OhSubscriberUpgradeable, OhStrategyStorage {
    using SafeERC20 for IERC20;

    event Liquidate(address indexed router, address indexed token, uint256 amount);
    event Sweep(address indexed token, uint256 amount, address recipient);

    /// @notice Only the Bank can execute these functions
    modifier onlyBank() {
        require(msg.sender == _bank(), "Strategy: Only Bank");
        _;
    }

    /// @notice Initialize the base Strategy
    /// @param registry_ Address of the Registry
    /// @param bank_ Address of Bank
    /// @param underlying_ Underying token that is deposited
    /// @param derivative_ Derivative token received from protocol, or address(0)
    /// @param reward_ Reward token received from protocol, or address(0)
    function initializeStrategy(
        address registry_,
        address bank_,
        address underlying_,
        address derivative_,
        address reward_
    ) internal initializer {
        initializeSubscriber(registry_);
        initializeStorage(bank_, underlying_, derivative_, reward_);
    }

    // amount of derivative tokens received from investing, if applicable
    function _derivativeBalance() internal view returns (uint256) {
        if (_derivative() == address(0)) {
            return 0;
        }
        return IERC20(_derivative()).balanceOf(address(this));
    }

    // amount of reward tokens awaiting liquidation, if applicable
    function _rewardBalance() internal view returns (uint256) {
        if (_reward() == address(0)) {
            return 0;
        }
        return IERC20(_reward()).balanceOf(address(this));
    }

    // amount of underlying awaiting investment
    function _underlyingBalance() internal view returns (uint256) {
        return IERC20(_underlying()).balanceOf(address(this));
    }

    // admin function to sweep any stuck / airdrop tokens to a given recipient
    function sweep(
        address token,
        uint256 amount,
        address recipient
    ) external onlyGovernance {
        // require(!_protected[token], "Strategy: Cannot sweep");
        OhTransferHelper.safeTokenTransfer(recipient, token, amount);
        emit Sweep(token, amount, recipient);
    }

    // liquidation function to swap rewards for underlying
    function liquidate(
        address from,
        address to,
        uint256 amount
    ) internal {
        address liquidator = IManager(manager()).liquidators(from, to);
        IERC20(from).safeIncreaseAllowance(liquidator, amount);
        ILiquidator(liquidator).liquidate(from, to, amount);
    }
}
