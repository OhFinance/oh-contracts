// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {OhSubscriber} from "./registry/OhSubscriber.sol";

/// @title Oh! Finance Migrator Token
/// @notice Protocol Governance and Profit-Share ERC-20 Token
contract OhMigratorToken is ERC20("Oh! Finance", "OH"), OhSubscriber {
    using SafeMath for uint256;

    /// @notice The max token supply, minted on initialization. 100m tokens.
    /// 7.5m public,
    uint256 public constant MAX_SUPPLY = 100000000e18;

    address public migrator;

    constructor(address registry_) OhSubscriber(registry_) {
        _mint(msg.sender, MAX_SUPPLY);
    }

    function setMigrator(address _migrator) external onlyGovernance {
        migrator = _migrator;
    }

    function migrate(uint256 _amount) external {
        require(migrator != address(0), "Migrate: No Migrator Token");

        _burn(msg.sender, _amount);
        IERC20(migrator).transfer(msg.sender, _amount);
    }
}
