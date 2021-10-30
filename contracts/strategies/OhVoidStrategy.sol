// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

// import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
// import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
//import {IStrategy} from "../interfaces/strategies/IStrategy.sol";
import {OhStrategy} from "./OhStrategy.sol";

/// @title Oh! Finance Void Strategy
/// @notice Void strategy meant to do nothing
contract OhVoidStrategy is OhStrategy {
    // using SafeMath for uint256;
    // using SafeERC20 for IERC20;

    constructor() initializer {}

    function initializeAaveV2Strategy(
        address registry_,
        address bank_
    ) public initializer {}

    // function investedBalance() public view override returns (uint256) {}

    // function invest() external override onlyBank {}

    // function _deposit() internal {}

    // function withdrawAll() external override onlyBank {}

    // function withdraw(uint256 amount) external override onlyBank returns (uint256) {}

    // function _withdraw(address recipient, uint256 amount) internal returns (uint256) {}
}
