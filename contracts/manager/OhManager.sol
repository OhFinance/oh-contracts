// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/EnumerableSet.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {IBank} from "../interfaces/IBank.sol";
import {IManager} from "../interfaces/IManager.sol";
import {OhSubscriber} from "../registry/OhSubscriber.sol";

/// @title Oh! Finance Manager
/// @dev The Manager contains references to all active banks, strategies, and liquidation contracts.
/// @dev This contract is used as the main control point for executing strategies
contract OhManager is IManager, OhSubscriber {
    using Address for address;
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @notice mapping of approved banks
    mapping(address => bool) public override banks;

    /// @notice mapping of `from` token to `to` token to liquidator contract
    mapping(address => mapping(address => address)) public override liquidators;

    /// @notice mapping of contracts that are whitelisted for Bank use/management
    mapping(address => bool) public override whitelisted;

    /// @dev mapping of Banks to all strategies, additive only
    mapping(address => EnumerableSet.AddressSet) internal _strategies;

    /// @dev mapping of Banks to current strategy working index
    mapping(address => uint8) internal _strategyIndex;

    /// @notice amount of profits reserved for protocol buybacks, base 1000
    uint256 public override buybackFee;

    /// @notice amount of profits reserved for fund management, base 1000
    uint256 public override managementFee;

    event BanksUpdated(address indexed bank, bool approved);
    event StrategiesUpdated(address indexed bank, address indexed strategy, bool approved);
    event LiquidatorsUpdated(
        address indexed oldLiquidator,
        address indexed newLiquidator,
        address indexed from,
        address to
    );

    /// @notice Only allow investing if bank is approved
    modifier validBank(address _bank) {
        require(banks[_bank], "Manager: Invalid Bank");
        _;
    }

    /// @notice Only allow EOAs or Whitelisted contracts to interact
    /// @dev Prevents sandwich / flash loan attacks
    modifier defense {
        require(
            msg.sender == tx.origin || whitelisted[msg.sender],
            "Manager: Only EOA or Whitelist"
        );
        _;
    }

    constructor(address registry_) OhSubscriber(registry_) {
        buybackFee = 200; // 20%
        managementFee = 20; // 2%
    }

    /// @notice Get the strategy at a given index i for a given bank
    function strategies(address _bank, uint256 i) external view override returns (address) {
        return _strategies[_bank].at(i);
    }

    /// @notice Get total number of strategies for a given bank
    /// @param _bank The Bank we are checking
    /// @return Amount of active strategies
    function totalStrategies(address _bank) external view override returns (uint256) {
        return _strategies[_bank].length();
    }

    /// @notice Rebalance Bank exposure by withdrawing all, then evenly distributing underlying to all strategies
    /// @param _bank The bank to rebalance
    function rebalance(address _bank) external defense validBank(_bank) {
        // Exit all strategies
        uint256 length = _strategies[_bank].length();
        for (uint256 i; i < length; i++) {
            IBank(_bank).exitAll(_strategies[_bank].at(i));
        }

        // Re-invest underlying evenly
        uint256 toInvest = IBank(_bank).underlyingBalance();
        for (uint256 i; i < length; i++) {
            uint256 amount = toInvest / length;
            IBank(_bank).invest(_strategies[_bank].at(i), amount);
        }
    }

    /// @notice Balance Bank exposure by evenly distributing underlying to all strategies, regardless of current weighting
    function balance(address _bank) external defense validBank(_bank) {
        uint256 length = _strategies[_bank].length();
        uint256 toInvest = IBank(_bank).underlyingBalance();
        for (uint256 i; i < length; i++) {
            uint256 amount = toInvest / length;
            IBank(_bank).invest(_strategies[_bank].at(i), amount);
        }
    }

    /// @notice Finance the next Strategy in the Bank queue with all available underlyign
    function finance(address _bank) external defense validBank(_bank) {
        uint256 length = _strategies[_bank].length();
        require(length > 0, "Bank: No Strategies");

        // get the next strategy, reset if current index greater than length
        uint8 i = _strategyIndex[_bank] < length ? _strategyIndex[_bank] : 0;
        address strategy = _strategies[_bank].at(i);

        // finance the strategy, increment index
        IBank(_bank).investAll(strategy);
        _strategyIndex[_bank] = i + 1;
    }

    /// @notice Sets the Bank approval
    /// @param _bank the bank to be approved/unapproved
    /// @param _approved the approval status of the bank
    /// @dev Only Governance can call this function
    function setBank(address _bank, bool _approved) external onlyGovernance {
        require(_bank.isContract(), "Manager: Not Contract");
        bool approved = banks[_bank];
        require(approved != _approved, "Manager: No Change");

        if (approved) {
            uint256 length = _strategies[_bank].length();
            for (uint256 i; i < length; i++) {
                IBank(_bank).exitAll(_strategies[_bank].at(i));
            }
        }

        emit BanksUpdated(_bank, _approved);
        banks[_bank] = _approved;
    }

    /// @notice Adds and approves a Strategy for a given Bank
    /// @param _bank the bank which uses the strategy
    /// @param _strategy the strategy to be approved/unapproved
    /// @dev Only Governance can call this function
    function addStrategy(address _bank, address _strategy) external onlyGovernance {
        require(_strategy.isContract() && _bank.isContract(), "Manager: Not Contract");
        require(!_strategies[_bank].contains(_strategy), "Manager: Already Added");
        emit StrategiesUpdated(_bank, _strategy, true);
        _strategies[_bank].add(_strategy);
    }

    /// @notice Adds and approves a Strategy for a given Bank
    /// @param _bank the bank which uses the strategy
    /// @param _strategy the strategy to be approved/unapproved
    /// @dev Only Governance can call this function
    function removeStrategy(address _bank, address _strategy) external onlyGovernance {
        require(_strategy.isContract() && _bank.isContract(), "Manager: Not Contract");
        require(_strategies[_bank].contains(_strategy), "Manager: Nothing to Remove");
        emit StrategiesUpdated(_bank, _strategy, false);
        _strategies[_bank].remove(_strategy);
    }

    /// @notice Sets the Liquidator contract for a given token
    /// @param _liquidator the liquidator contract
    /// @param _from the token we have to liquidate
    /// @param _to the token we want to receive
    /// @dev Only Governance can call this function
    function setLiquidator(
        address _liquidator,
        address _from,
        address _to
    ) external onlyGovernance {
        require(_liquidator.isContract(), "Registry: Not Contract");
        emit LiquidatorsUpdated(liquidators[_from][_to], _liquidator, _from, _to);
        liquidators[_from][_to] = _liquidator;
    }

    /// @notice Whitelists strategy for Bank use/management
    /// @param _contract the strategy contract
    /// @param _whitelisted the whitelisted status of the strategy
    /// @dev Only Governance can call this function
    function setWhitelisted(address _contract, bool _whitelisted) external onlyGovernance {
        require(_contract.isContract(), "Registry: Not Contract");
        whitelisted[_contract] = _whitelisted;
    }

    /// @notice Sets the protocol buyback percentage (Profit Share)
    /// @param _buybackFee The new buyback fee
    /// @dev Only Governance; base 1000, 1% = 10
    function setBuybackFee(uint256 _buybackFee) external onlyGovernance {
        require(_buybackFee > 0, "Registry: Invalid Buyback");
        require(_buybackFee < 500, "Registry: Buyback Too High");
        buybackFee = _buybackFee;
    }

    /// @notice Sets the protocol management fee percentage
    /// @param _managementFee The new management fee
    /// @dev Only Governance; base 1000, 1% = 10
    function setManagementFee(uint256 _managementFee) external onlyGovernance {
        require(_managementFee > 0, "Registry: Invalid Mgmt");
        require(_managementFee < 100, "Registry: Mgmt Too High");
        managementFee = _managementFee;
    }
}
