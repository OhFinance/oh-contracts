// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {IStrategy} from "../../interfaces/IStrategy.sol";
import {OhTransferHelper} from "../../libraries/OhTransferHelper.sol";
import {OhStrategy} from "../OhStrategy.sol";
import {OhCurve3PoolHelper} from "./OhCurve3PoolHelper.sol";
import {OhCurve3PoolStrategyStorage} from "./OhCurve3PoolStrategyStorage.sol";

/// @title Oh! Finance Curve 3Pool Strategy
/// @notice Standard Curve 3Pool LP + Gauge Single Underlying Strategy
/// @notice 3Pool Underlying, in order: (DAI, USDC, USDT)
contract OhCurve3PoolStrategy is
    IStrategy,
    OhCurve3PoolHelper,
    OhStrategy,
    OhCurve3PoolStrategyStorage
{
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /// @notice Initialize the Curve 3Pool Strategy
    /// @param registry_ Address of the Registry
    /// @param bank_ Address of the Bank
    /// @param underlying_ Underlying (DAI, USDC, USDT)
    /// @param derivative_ 3CRV LP Token
    /// @param reward_ CRV Gov Token
    /// @param pool_ Address of the Curve 3Pool
    /// @param gauge_ Curve Gauge, Staking Contract
    /// @param mintr_ Curve Mintr, Rewards Contract
    /// @param index_ Underlying 3Pool Index
    function initializeCurve3PoolStrategy(
        address registry_,
        address bank_,
        address underlying_,
        address derivative_,
        address reward_,
        address pool_,
        address gauge_,
        address mintr_,
        uint256 index_
    ) public initializer onlyGovernancePost {
        initializeStrategy(registry_, bank_, underlying_, derivative_, reward_);
        initializeCurve3PoolStorage(pool_, gauge_, mintr_, index_);
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

    function pool() public view returns (address) {
        return _pool();
    }

    function gauge() public view returns (address) {
        return _gauge();
    }

    function mintr() public view returns (address) {
        return _mintr();
    }

    function index() public view returns (uint256) {
        return _index();
    }

    // calculate the total underlying balance
    function investedBalance() public view override returns (uint256) {
        return calcWithdraw(pool(), stakedBalance(), int128(index()));
    }

    // amount of 3CRV staked in the Gauge
    function stakedBalance() public view returns (uint256) {
        return staked(gauge());
    }

    // execute the 3Pool strategy
    function invest() external override onlyBank {
        _compound();
        _deposit();
    }

    // compound rewards into underlying through liquidation
    function _compound() internal {
        // claim available CRV rewards
        claim(mintr(), gauge());
        uint256 rewardAmount = rewardBalance();
        if (rewardAmount > 0) {
            liquidate(reward(), underlying(), rewardAmount);
        }
    }

    // deposit underlying into 3Pool to get 3CRV and stake into Gauge
    function _deposit() internal {
        uint256 amount = _underlyingBalance();
        if (amount > 0) {
            // add liquidity to 3Pool to receive 3CRV
            addLiquidity(pool(), underlying(), index(), amount);
            // stake all received in the 3CRV gauge
            stake(gauge(), derivative(), derivativeBalance());
        }
    }

    function withdrawAll() external override onlyBank {
        uint256 invested = investedBalance();
        _withdraw(msg.sender, invested);
    }

    function withdraw(uint256 amount) external override onlyBank returns (uint256) {
        uint256 withdrawn = _withdraw(msg.sender, amount);
        return withdrawn;
    }

    // withdraw underlying tokens from the protocol
    // TODO: Double check withdrawGauge math, TransferHelper
    function _withdraw(address recipient, uint256 amount) internal returns (uint256) {
        if (amount == 0) {
            return 0;
        }

        // calculate amount of shares to redeem
        uint256 invested = investedBalance();
        uint256 supplyShare = amount.mul(1e18).div(invested);
        uint256 redeemAmount = supplyShare.mul(invested).div(1e18);

        // safely withdraw from Curve
        if (redeemAmount > invested) {
            removeLiquidity(pool(), index(), invested);
        } else {
            removeLiquidity(pool(), index(), redeemAmount);
        }

        // withdraw to bank
        uint256 withdrawn = OhTransferHelper.safeTokenTransfer(recipient, underlying(), amount);
        return withdrawn;
    }
}
