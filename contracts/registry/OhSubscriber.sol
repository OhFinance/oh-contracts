// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {ISubscriber} from "../interfaces/ISubscriber.sol";
import {IRegistry} from "../interfaces/IRegistry.sol";

/// @title Oh! Finance Subscriber
/// @notice Base Oh! Finance contract used to control access throughout the protocol
abstract contract OhSubscriber is ISubscriber {
    /// @notice Address of the protocol registry
    address public override registry;

    /// @notice Only allow authorized addresses (governance or manager) to execute a function
    modifier onlyAuthorized {
        require(
            msg.sender == governance() || msg.sender == manager(),
            "Subscriber: Only Authorized"
        );
        _;
    }

    /// @notice Only allow the governance address to execute a function
    modifier onlyGovernance {
        require(msg.sender == governance(), "Subscriber: Only Governance");
        _;
    }

    constructor(address _registry) {
        require(Address.isContract(_registry), "Subscriber: Invalid Registry");
        registry = _registry;
    }

    /// @notice Get the Governance address
    /// @return The current Governance address
    function governance() public view override returns (address) {
        return IRegistry(registry).governance();
    }

    /// @notice Get the Manager address
    /// @return The current Manager address
    function manager() public view override returns (address) {
        return IRegistry(registry).manager();
    }

    /// @notice Set the Registry for the contract. Only callable by Governance.
    /// @param _registry The new registry
    /// @dev Requires sender to be Governance of the new Registry to avoid bricking.
    /// @dev Ideally should not be used
    function setRegistry(address _registry) external onlyGovernance {
        require(Address.isContract(_registry), "Subscriber: Invalid Registry");

        registry = _registry;
        require(msg.sender == governance(), "Subscriber: Bad Governance");
    }
}
