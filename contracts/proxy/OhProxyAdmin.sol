// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {OhSubscriber} from "../registry/OhSubscriber.sol";
import {OhUpgradeableProxy} from "./OhUpgradeableProxy.sol";
import {ProxyAdmin} from "@openzeppelin/contracts/proxy/ProxyAdmin.sol";

/// @title Oh! Finance Proxy Admin
/// @notice Contract used to manage and execute proxy upgrades, controlled by Governance
/// @dev Based on OpenZeppelin Implementation
/// @dev https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.4/contracts/proxy/ProxyAdmin.sol
contract OhProxyAdmin is ProxyAdmin, OhSubscriber {
    constructor(address _registry) OhSubscriber(_registry) {
        transferOwnership(governance());
    }

    /**
     * @dev Returns the current implementation of `proxy`.
     *
     * Requirements:
     *
     * - This contract must be the admin of `proxy`.
     */
    // function getProxyImplementation(OhUpgradeableProxy proxy)
    //     public
    //     view
    //     virtual
    //     returns (address)
    // {
    //     // We need to manually run the static call since the getter cannot be flagged as view
    //     // bytes4(keccak256("implementation()")) == 0x5c60da1b
    //     (bool success, bytes memory returndata) = address(proxy).staticcall(hex"5c60da1b");
    //     require(success);
    //     return abi.decode(returndata, (address));
    // }

    // /**
    //  * @dev Returns the current admin of `proxy`.
    //  *
    //  * Requirements:
    //  *
    //  * - This contract must be the admin of `proxy`.
    //  */
    // function getProxyAdmin(OhUpgradeableProxy proxy) public view virtual returns (address) {
    //     // We need to manually run the static call since the getter cannot be flagged as view
    //     // bytes4(keccak256("admin()")) == 0xf851a440
    //     (bool success, bytes memory returndata) = address(proxy).staticcall(hex"f851a440");
    //     require(success);
    //     return abi.decode(returndata, (address));
    // }

    // /**
    //  * @dev Changes the admin of `proxy` to `newAdmin`.
    //  *
    //  * Requirements:
    //  *
    //  * - This contract must be the current admin of `proxy`.
    //  */
    // function changeProxyAdmin(OhUpgradeableProxy proxy, address newAdmin)
    //     public
    //     virtual
    //     onlyGovernance
    // {
    //     proxy.changeAdmin(newAdmin);
    // }

    // /**
    //  * @dev Upgrades `proxy` to `implementation`. See {TransparentUpgradeableProxy-upgradeTo}.
    //  *
    //  * Requirements:
    //  *
    //  * - This contract must be the admin of `proxy`.
    //  */
    // function upgrade(OhUpgradeableProxy proxy, address implementation)
    //     public
    //     virtual
    //     onlyGovernance
    // {
    //     proxy.upgradeTo(implementation);
    // }

    // /**
    //  * @dev Upgrades `proxy` to `implementation` and calls a function on the new implementation. See
    //  * {TransparentUpgradeableProxy-upgradeToAndCall}.
    //  *
    //  * Requirements:
    //  *
    //  * - This contract must be the admin of `proxy`.
    //  */
    // function upgradeAndCall(
    //     OhUpgradeableProxy proxy,
    //     address implementation,
    //     bytes memory data
    // ) public payable virtual onlyGovernance {
    //     proxy.upgradeToAndCall{value: msg.value}(implementation, data);
    // }
}
