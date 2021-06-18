// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {IBank} from "../interfaces/bank/IBank.sol";
import {IGovernor} from "../interfaces/IGovernor.sol";
import {IManager} from "../interfaces/IManager.sol";
import {OhSubscriber} from "../registry/OhSubscriber.sol";

/// @title Oh! Finance Governor
/// @notice Executor Contract that queues up and executes on-chain transactions to modify the protocol
/// @notice Queued actions must come from a successful proposal
/// @dev Proposer-Executor Relationship
/// @dev Transactions can be executed after the `delay` has passed
contract OhGovernor is OhSubscriber, IGovernor {
    using Address for address;
    using SafeMath for uint256;

    /// @notice
    uint256 public constant override GRACE_PERIOD = 14 days;

    /// @notice Minimum time period transactions must be queued for
    uint256 public constant MINIMUM_DELAY = 2 days;

    /// @notice Maximum time period transactions can be queued for
    uint256 public constant MAXIMUM_DELAY = 30 days;

    /// @notice The Governor admin
    address public admin;

    /// @notice The Governor admin pending acceptance
    address public pendingAdmin;

    /// @notice Time delay before queued transactions can be executed
    uint256 public override delay;

    /// @notice Transaction Queue of all successfull proposal actions
    mapping(bytes32 => bool) public override queuedTransactions;

    event NewAdmin(address indexed newAdmin);
    event NewPendingAdmin(address indexed newPendingAdmin);
    event NewDelay(uint256 indexed newDelay);
    event CancelTransaction(bytes32 indexed txHash, address indexed target, uint256 value, string signature, bytes data, uint256 eta);
    event ExecuteTransaction(bytes32 indexed txHash, address indexed target, uint256 value, string signature, bytes data, uint256 eta);
    event QueueTransaction(bytes32 indexed txHash, address indexed target, uint256 value, string signature, bytes data, uint256 eta);

    modifier onlyAdmin {
        require(msg.sender == admin, "Governor: Only Admin");
        _;
    }

    modifier onlySelf {
        require(msg.sender == address(this), "Governor: Only Self");
        _;
    }

    constructor(address registry_, address admin_, uint256 delay_) OhSubscriber(registry_) {
        require(delay_ >= MINIMUM_DELAY, "Governor: Delay Too Low");
        require(delay_ <= MAXIMUM_DELAY, "Governor: Delay Too High");

        admin = admin_;
        delay = delay_;
    }

    receive() external payable {}

    function acceptAdmin() external override {
        require(msg.sender == pendingAdmin, "Governor: Only Pending Admin");
        admin = msg.sender;
        pendingAdmin = address(0);

        emit NewAdmin(admin);
    }

    function setPendingAdmin(address pendingAdmin_) external onlySelf {
        pendingAdmin = pendingAdmin_;

        emit NewPendingAdmin(pendingAdmin);
    }

    function setDelay(uint256 delay_) external onlySelf {
        require(delay_ >= MINIMUM_DELAY, "Governor: Delay Too Low");
        require(delay_ <= MAXIMUM_DELAY, "Governor: Delay Too High");
        delay = delay_;

        emit NewDelay(delay);
    }

    function cancelTransaction(
        address target,
        uint256 value,
        string memory signature,
        bytes memory data,
        uint256 eta
    ) external override onlyAdmin {
        bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));
        queuedTransactions[txHash] = false;

        emit CancelTransaction(txHash, target, value, signature, data, eta);
    }

    function executeTransaction(
        address target,
        uint256 value,
        string memory signature,
        bytes memory data,
        uint256 eta
    ) external payable override onlyAdmin returns (bytes memory) {
        bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));

        require(queuedTransactions[txHash], "Governor: Transaction Not Queued");
        require(getBlockTimestamp() >= eta, "Governor: Transaction Expired");
        require(getBlockTimestamp() <= eta.add(GRACE_PERIOD), "Governor: Transaction Stale");

        queuedTransactions[txHash] = false;

        bytes memory callData;
        if (bytes(signature).length == 0) {
            callData = data;
        } else {
            callData = abi.encodePacked(bytes4(keccak256(bytes(signature))), data);
        }

        // (bool success, bytes memory returnData) = target.call{value: value}(callData);
        // require(success, "Timelock::executeTransaction: Transaction execution reverted.");
        bytes memory returnData = target.functionCallWithValue(callData, value);

        emit ExecuteTransaction(txHash, target, value, signature, data, eta);
        return returnData;
    }

    function queueTransaction(
        address target,
        uint256 value,
        string memory signature,
        bytes memory data,
        uint256 eta
    ) external override onlyAdmin returns (bytes32) {
        require(eta >= getBlockTimestamp().add(delay), "Governor: ETA Too Short");

        bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));
        queuedTransactions[txHash] = true;

        emit QueueTransaction(txHash, target, value, signature, data, eta);
        return txHash;
    }

    function executeEmergencyPause(address bank) external override onlyAdmin {
        IManager(manager()).exitAll(bank);
        IBank(bank).pause();
    }

    function executePause(address bank) external override onlyAdmin {
        IBank(bank).pause();
    }

    function executeUnpause(address bank) external override onlyAdmin {
        IBank(bank).unpause();
    }

    function getBlockTimestamp() internal view returns (uint256) {
        return block.timestamp;
    }
}
