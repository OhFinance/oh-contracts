// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {IStrategy} from "../../interfaces/IStrategy.sol";
import {OhTransferHelper} from "../../libraries/OhTransferHelper.sol";
import {OhStrategy} from "../OhStrategy.sol";
import {OhAaveV2Helper} from "./OhAaveV2Helper.sol";
import {OhAaveV2StrategyStorage} from "./OhAaveV2StrategyStorage.sol";

/// @title Oh! Finance Aave V2 Strategy
/// @notice Standard strategy using Aave V2 Protocol
/// @dev Underlying: USDC, USDT, etc.
/// @dev Derivative: aToken, 1:1 ratio with underlying
/// @dev https://docs.aave.com/developers/the-core-protocol/atokens
contract OhAaveV2Strategy is IStrategy, OhAaveV2Helper, OhStrategy, OhAaveV2StrategyStorage {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /// Initializes the AaveV2 Strategy
    /// @param registry_ the registry contract
    /// @param bank_ the bank associated with the strategy
    /// @param underlying_ the underlying token that is deposited
    /// @param derivative_ the aToken address received from Aave
    /// @param reward_ the address of the reward token stkAAVE
    /// @param lendingPool_ the AaveV2 lending pool that we lend to
    /// @param incentiveController_ the AaveV2 rewards contract
    /// @dev The function should be called at time of deployment
    function initializeAaveV2Strategy(
        address registry_,
        address bank_,
        address underlying_,
        address derivative_,
        address reward_,
        address lendingPool_,
        address incentiveController_
    ) public initializer onlyGovernancePost {
        initializeStrategy(registry_, bank_, underlying_, derivative_, reward_);
        initializeAaveV2Storage(lendingPool_, incentiveController_);
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

    // aTokens are 1:1 with underlying, they are continuously distributed to users
    function investedBalance() public view override returns (uint256) {
        return _derivativeBalance();
    }

    function lendingPool() public view returns (address) {
        return _lendingPool();
    }

    function incentiveController() public view returns (address) {
        return _incentiveController();
    }

    function invest() external override onlyBank {
        _deposit();
        _compound();
    }

    function _compound() internal {
        claim(incentiveController(), derivative());
        uint256 amount = rewardBalance();
        // unwrap the stkAAVE to AAVE
        if (amount > 0) {
            liquidate(reward(), underlying(), amount);
        }
    }

    function _deposit() internal {
        uint256 amount = underlyingBalance();
        if (amount > 0) {
            lend(lendingPool(), underlying(), amount);
        }
    }

    function withdrawAll() external override onlyBank {
        uint256 amount = derivativeBalance();
        _withdraw(msg.sender, amount);
    }

    function withdraw(uint256 amount) external override onlyBank returns (uint256) {
        uint256 withdrawn = _withdraw(msg.sender, amount);
        return withdrawn;
    }

    // withdraw tokens from protocol after converting aTokens to underlying
    function _withdraw(address recipient, uint256 amount) internal returns (uint256) {
        if (amount == 0) {
            return 0;
        }
        uint256 reclaimed = reclaim(lendingPool(), derivative(), amount);
        uint256 withdrawn = OhTransferHelper.safeTokenTransfer(recipient, underlying(), reclaimed);
        return withdrawn;
    }
}
