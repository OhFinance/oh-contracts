// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import {OhUpgradeable} from "../proxy/OhUpgradeable.sol";

abstract contract OhBankStorage is Initializable, OhUpgradeable {
    bytes32 internal constant _DOMAIN_SEPARATOR_SLOT =
        0x9b1cbc96f8f6a4f5c93096e4f8fb48acd2bc8478a8a41d4f61928be125f19dc1;

    bytes32 internal constant _DOMAIN_TYPEHASH_SLOT =
        0xacaf6b3315d453daef99f17e686a2a6188e8002673287fe4ea1165aa67f63094;

    bytes32 internal constant _PERMIT_TYPEHASH_SLOT =
        0x545355ae154ed3300c6e5c6706f0806d4e1ae00b04018e7cbb4f76877f3e478a;

    bytes32 internal constant _UNDERLYING_SLOT =
        0x90773825e4bc2bc5b176633f3046da46e88d251c6a1ff0816162f0a2ed8410ce;

    constructor() {
        assert(
            _DOMAIN_SEPARATOR_SLOT ==
                bytes32(uint256(keccak256("eip1967.bank.DOMAIN_SEPARATOR")) - 1)
        );
        assert(
            _DOMAIN_TYPEHASH_SLOT == bytes32(uint256(keccak256("eip1967.bank.DOMAIN_TYPEHASH")) - 1)
        );
        assert(
            _PERMIT_TYPEHASH_SLOT == bytes32(uint256(keccak256("eip1967.bank.PERMIT_TYPEHASH")) - 1)
        );
        assert(_UNDERLYING_SLOT == bytes32(uint256(keccak256("eip1967.bank.underlying")) - 1));
    }

    function initializeStorage(address underlying_) internal initializer {
        _set_DOMAIN_TYPEHASH(
            keccak256(
                "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
            )
        );
        _set_PERMIT_TYPEHASH(
            keccak256(
                "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
            )
        );

        
        _setUnderlying(underlying_);
    }

    function _DOMAIN_SEPARATOR() internal view returns (bytes32) {
        return getBytes32(_DOMAIN_SEPARATOR_SLOT);
    }

    function _DOMAIN_TYPEHASH() internal view returns (bytes32) {
        return getBytes32(_DOMAIN_TYPEHASH_SLOT);
    }

    function _PERMIT_TYPEHASH() internal view returns (bytes32) {
        return getBytes32(_PERMIT_TYPEHASH_SLOT);
    }

    function _underlying() internal view returns (address) {
        return getAddress(_UNDERLYING_SLOT);
    }

    function _set_DOMAIN_SEPARATOR(bytes32 DOMAIN_SEPARATOR_) internal {
        setBytes32(_DOMAIN_SEPARATOR_SLOT, DOMAIN_SEPARATOR_);
    }

    function _set_DOMAIN_TYPEHASH(bytes32 DOMAIN_TYPEHASH_) internal {
        setBytes32(_DOMAIN_TYPEHASH_SLOT, DOMAIN_TYPEHASH_);
    }

    function _set_PERMIT_TYPEHASH(bytes32 PERMIT_TYPEHASH_) internal {
        setBytes32(_PERMIT_TYPEHASH_SLOT, PERMIT_TYPEHASH_);
    }

    function _setUnderlying(address underlying_) internal {
        setAddress(_UNDERLYING_SLOT, underlying_);
    }
}
