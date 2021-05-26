// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import {IAaveV2StrategyStorage} from "../../interfaces/strategies/aave/IAaveV2StrategyStorage.sol";
import {OhUpgradeable} from "../../proxy/OhUpgradeable.sol";

contract OhAaveV2StrategyStorage is Initializable, OhUpgradeable, IAaveV2StrategyStorage {
    bytes32 internal constant _LENDING_POOL_SLOT = 0x32da969ce0980814ec712773a44ab0fbc7a926f6c25ab5c3ab143cbaf257713b;
    bytes32 internal constant _INCENTIVES_CONTROLLER_SLOT = 0x8354a0ba382ef5f265c75cfb638fc27db941b9db0fd5dc17719a651d5d4cda15;

    constructor() {
        assert(_LENDING_POOL_SLOT == bytes32(uint256(keccak256("eip1967.aaveV2Strategy.lendingPool")) - 1));
        assert(_INCENTIVES_CONTROLLER_SLOT == bytes32(uint256(keccak256("eip1967.aaveV2Strategy.incentivesController")) - 1));
    }

    function initializeAaveV2Storage(address lendingPool_, address incentiveController_) internal initializer {
        _setLendingPool(lendingPool_);
        _setIncentiveController(incentiveController_);
    }

    function lendingPool() public view override returns (address) {
        return getAddress(_LENDING_POOL_SLOT);
    }

    function incentivesController() public view override returns (address) {
        return getAddress(_INCENTIVES_CONTROLLER_SLOT);
    }

    function _setLendingPool(address lendingPool_) internal {
        setAddress(_LENDING_POOL_SLOT, lendingPool_);
    }

    function _setIncentiveController(address incentiveController_) internal {
        setAddress(_INCENTIVES_CONTROLLER_SLOT, incentiveController_);
    }
}
