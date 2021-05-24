// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import {OhUpgradeable} from "../../proxy/OhUpgradeable.sol";

abstract contract OhAaveV2StrategyStorage is Initializable, OhUpgradeable {
    bytes32 internal constant _LENDING_POOL_SLOT =
        0x32da969ce0980814ec712773a44ab0fbc7a926f6c25ab5c3ab143cbaf257713b;
    bytes32 internal constant _INCENTIVE_CONTROLLER_SLOT =
        0xf4fb7dced02b6dee0f380a127474b9183bda8df26b75ff76425c7295e033cb0f;

    constructor() {
        assert(
            _LENDING_POOL_SLOT ==
                bytes32(uint256(keccak256("eip1967.aaveV2Strategy.lendingPool")) - 1)
        );
        assert(
            _INCENTIVE_CONTROLLER_SLOT ==
                bytes32(uint256(keccak256("eip1967.aaveV2Strategy.incentiveController")) - 1)
        );
    }

    function initializeAaveV2Storage(address lendingPool_, address incentiveController_)
        internal
        initializer
    {
        _setLendingPool(lendingPool_);
        _setIncentiveController(incentiveController_);
    }

    function _lendingPool() internal view returns (address) {
        return getAddress(_LENDING_POOL_SLOT);
    }

    function _incentiveController() internal view returns (address) {
        return getAddress(_INCENTIVE_CONTROLLER_SLOT);
    }

    function _setLendingPool(address lendingPool_) internal {
        setAddress(_LENDING_POOL_SLOT, lendingPool_);
    }

    function _setIncentiveController(address incentiveController_) internal {
        setAddress(_INCENTIVE_CONTROLLER_SLOT, incentiveController_);
    }
}
