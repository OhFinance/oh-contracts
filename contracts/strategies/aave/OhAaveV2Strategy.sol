// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {IStrategy} from "../../interfaces/strategies/IStrategy.sol";
import {TransferHelper} from "../../libraries/TransferHelper.sol";
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

    /// @notice Initialize the AaveV2 Strategy Logic
    constructor() initializer {
        assert(registry() == address(0));
        assert(bank() == address(0));
        assert(underlying() == address(0));
        assert(reward() == address(0));
    }

    /// @notice Initialize the AaveV2 Strategy Proxy
    /// @param registry_ the registry contract
    /// @param bank_ the bank associated with the strategy
    /// @param underlying_ the underlying token that is deposited
    /// @param derivative_ the aToken address received from Aave
    /// @param reward_ the address of the reward token stkAAVE
    /// @param lendingPool_ the AaveV2 lending pool that we lend to
    /// @param incentivesController_ the AaveV2 rewards contract
    /// @dev The function should be called at time of deployment
    function initializeAaveV2Strategy(
        address registry_,
        address bank_,
        address underlying_,
        address derivative_,
        address reward_,
        address lendingPool_,
        address incentivesController_
    ) public initializer {
        initializeStrategy(registry_, bank_, underlying_, derivative_, reward_);
        initializeAaveV2Storage(lendingPool_, incentivesController_);
    }

    /// @notice Balance of underlying invested in AaveV2
    /// @dev aTokens are 1:1 with underlying, they are continuously distributed to users
    function investedBalance() public view override returns (uint256) {
        return derivativeBalance();
    }

    function invest() external override onlyBank {
        _deposit();
        _compound();
    }

    function withdraw(uint256 amount) external override onlyBank returns (uint256) {
        uint256 withdrawn = _withdraw(msg.sender, amount);
        return withdrawn;
    }

    function withdrawAll() external override onlyBank {
        uint256 amount = derivativeBalance();
        _withdraw(msg.sender, amount);
    }

    function _compound() internal {
        claim(incentivesController(), derivative());
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

    // withdraw tokens from protocol after converting aTokens to underlying
    function _withdraw(address recipient, uint256 amount) internal returns (uint256) {
        if (amount == 0) {
            return 0;
        }
        uint256 reclaimed = reclaim(lendingPool(), underlying(), amount);
        uint256 withdrawn = TransferHelper.safeTokenTransfer(recipient, underlying(), reclaimed);
        return withdrawn;
    }
}
