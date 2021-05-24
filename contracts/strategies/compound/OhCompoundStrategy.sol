// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {IStrategy} from "../../interfaces/IStrategy.sol";
import {OhTransferHelper} from "../../libraries/OhTransferHelper.sol";
import {OhStrategy} from "../OhStrategy.sol";
import {OhCompoundHelper} from "./OhCompoundHelper.sol";
import {OhCompoundStrategyStorage} from "./OhCompoundStrategyStorage.sol";

/// @title Oh! Finance Compound Strategy
/// @notice Standard, unleveraged strategy. Invest underlying tokens into derivative cTokens
/// @dev https://compound.finance/docs/ctokens
contract OhCompoundStrategy is IStrategy, OhCompoundHelper, OhStrategy, OhCompoundStrategyStorage {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /// @notice Initializes the Compound Strategy
    /// @param registry_ the registry contract
    /// @param bank_ the bank associated with the strategy
    /// @param underlying_ the underlying token that is deposited
    /// @param derivative_ the cToken address received from Compound
    /// @param reward_ the address of the reward token COMP
    /// @param comptroller_ the Compound rewards contract
    /// @dev The function should be called at time of deployment
    function initializeCompoundStrategy(
        address registry_,
        address bank_,
        address underlying_,
        address derivative_,
        address reward_,
        address comptroller_
    ) public initializer onlyGovernancePost {
        initializeStrategy(registry_, bank_, underlying_, derivative_, reward_);
        initializeCompoundStorage(comptroller_);

        IERC20(derivative_).safeApprove(underlying_, type(uint256).max);
    }

    function bank() public view override returns (address) {
        return _bank();
    }

    function derivative() public view override returns (address) {
        return _derivative();
    }

    function reward() public view override returns (address) {
        return _reward();
    }

    function underlying() public view override returns (address) {
        return _underlying();
    }

    function derivativeBalance() public view override returns (uint256) {
        return _derivativeBalance();
    }

    function rewardBalance() public view override returns (uint256) {
        return _rewardBalance();
    }

    function underlyingBalance() public view override returns (uint256) {
        return _underlyingBalance();
    }

    function investedBalance() public view override returns (uint256) {
        uint256 exchangeRate = getExchangeRate(derivative());
        return exchangeRate.mul(derivativeBalance()).div(1e18);
    }

    function comptroller() public view returns (address) {
        return _comptroller();
    }

    function invest() external override onlyBank {
        _compound();
        _deposit();
    }

    function _compound() internal {
        claim(comptroller());
        uint256 amount = rewardBalance();
        if (amount > 0) {
            liquidate(reward(), underlying(), amount);
        }
    }

    // deposit underlying tokens into Compound, minting cTokens
    function _deposit() internal {
        uint256 amount = underlyingBalance();
        if (amount > 0) {
            mint(underlying(), derivative(), amount);
        }
    }

    // withdraw all underlying by redeem all cTokens
    function withdrawAll() external override onlyBank {
        uint256 invested = investedBalance();
        _withdraw(msg.sender, invested);
    }

    // withdraw an amount of underlying tokens
    function withdraw(uint256 amount) external override onlyBank returns (uint256) {
        uint256 withdrawn = _withdraw(msg.sender, amount);
        return withdrawn;
    }

    // withdraw underlying tokens from the protocol after redeeming them from compound
    function _withdraw(address recipient, uint256 amount) internal returns (uint256) {
        if (amount == 0) {
            return 0;
        }

        // calculate amount of shares to redeem
        uint256 invested = investedBalance();
        uint256 supplyShare = amount.mul(1e18).div(invested);
        uint256 redeemAmount = supplyShare.mul(invested).div(1e18);

        // safely redeem from Compound
        if (redeemAmount > invested) {
            redeemUnderlying(derivative(), invested);
        } else {
            redeemUnderlying(derivative(), redeemAmount);
        }

        // withdraw to bank
        uint256 withdrawn = OhTransferHelper.safeTokenTransfer(recipient, underlying(), amount);
        return withdrawn;
    }
}