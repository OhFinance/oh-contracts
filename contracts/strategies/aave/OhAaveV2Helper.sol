// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {ILendingPoolV2} from "./interfaces/ILendingPoolV2.sol";
import {ILendingPoolAddressesProviderV2} from "./interfaces/ILendingPoolAddressesProviderV2.sol";
import {IAaveIncentivesController} from "./interfaces/IAaveIncentivesController.sol";
import {IAaveProtocolDataProviderV2} from "./interfaces/IAaveProtocolDataProviderV2.sol";

/// @title Oh! Finance AaveV2 Helper
/// @notice Helper functions to interact with the AaveV2
/// @dev https://docs.aave.com/portal/
abstract contract OhAaveV2Helper {
    using SafeERC20 for IERC20;

    /// @notice Get the AaveV2 aToken for a given underlying
    /// @param dataProvider The AaveV2 Data Provider
    /// @param underlying The underlying token to check
    function aToken(address dataProvider, address underlying) internal view returns (address) {
        (address aTokenAddress, , ) =
            IAaveProtocolDataProviderV2(dataProvider).getReserveTokensAddresses(underlying);
        return aTokenAddress;
    }

    /// @notice Get the AaveV2 Lending Pool
    /// @param addressProvider The AaveV2 Address Provider
    function lendingPool(address addressProvider) internal view returns (address) {
        return ILendingPoolAddressesProviderV2(addressProvider).getLendingPool();
    }

    /// @notice Claim stkAAVE from the AaveV2 Incentive Controller
    /// @param incentiveController The AaveV2 Incentive Controller
    /// @param token The aToken to claim rewards for
    function claim(address incentiveController, address token) internal {
        address[] memory tokens = new address[](1);
        tokens[0] = token;

        uint256 rewards =
            IAaveIncentivesController(incentiveController).getRewardsBalance(tokens, address(this));

        if (rewards > 0) {
            IAaveIncentivesController(incentiveController).claimRewards(
                tokens,
                rewards,
                address(this)
            );
        }
    }

    /// @notice Lend underlying to Aave V2 Lending Pool, receive aTokens
    /// @param pool The AaveV2 Lending Pool
    /// @param underlying The underlying ERC20 to lend
    /// @param amount The amount of underlying to lend
    function lend(
        address pool,
        address underlying,
        uint256 amount
    ) internal {
        IERC20(underlying).safeIncreaseAllowance(pool, amount);
        ILendingPoolV2(pool).deposit(
            underlying,
            amount,
            address(this),
            0 // referral code
        );
    }

    /// @notice Reclaim underlying by sending aTokens to Aave V2 Lending Pool
    /// @param pool The AaveV2 Lending Pool
    /// @param token The aToken to redeem for underlying
    /// @param amount The amount of aTokens to send
    function reclaim(
        address pool,
        address token,
        uint256 amount
    ) internal returns (uint256) {
        uint256 balance = IERC20(token).balanceOf(address(this));
        IERC20(token).safeIncreaseAllowance(pool, amount);
        uint256 withdrawn = ILendingPoolV2(pool).withdraw(token, amount, address(this));
        require(withdrawn == amount || withdrawn == balance, "AaveV2: Withdraw failed");
        return withdrawn;
    }
}
