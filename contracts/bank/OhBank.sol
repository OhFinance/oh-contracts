// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {
    ERC20Upgradeable
} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {IBank} from "../interfaces/IBank.sol";
import {IManager} from "../interfaces/IManager.sol";
import {IStrategy} from "../interfaces/IStrategy.sol";
import {IRegistry} from "../interfaces/IRegistry.sol";
import {OhTransferHelper} from "../libraries/OhTransferHelper.sol";
import {OhSubscriberUpgradeable} from "../registry/OhSubscriberUpgradeable.sol";
import {OhBankStorage} from "./OhBankStorage.sol";

/// @title Oh! Finance Bank
/// @notice Base Upgradeable Bank Contract
/// @notice ERC-20 Token that represents user share ownership
contract OhBank is ERC20Upgradeable, IBank, OhSubscriberUpgradeable, OhBankStorage {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    event InvestAll(uint256 amount);
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);

    modifier defense {
        require(
            msg.sender == tx.origin || IManager(manager()).whitelisted(msg.sender),
            "Bank: Only EOA or whitelisted"
        );
        _;
    }

    /// @notice Initialize the Bank Proxy
    /// @param registry_ the address of the registry
    /// @param underlying_ the address of the underlying token that is deposited
    /// @dev Should be called when deploying the proxy contract
    function initializeBank(
        string memory name_,
        string memory symbol_,
        address registry_,
        address underlying_
    ) public initializer onlyGovernancePost {
        // setup token + subscriber, use same token decimals
        uint8 decimals_ = ERC20Upgradeable(underlying_).decimals();
        __ERC20_init(name_, symbol_);
        _setupDecimals(decimals_);

        initializeSubscriber(registry_);
        initializeStorage(underlying_);
    }

    /// @notice
    function strategies(uint256 i) public view override returns (address) {
        return IManager(manager()).strategies(address(this), i);
    }

    /// @notice
    function totalStrategies() public view override returns (uint256) {
        return IManager(manager()).totalStrategies(address(this));
    }

    /// @notice The EIP-712 typehash used for replay protection, set at deployment
    function DOMAIN_SEPARATOR() public view returns (bytes32) {
        return _DOMAIN_SEPARATOR();
    }

    /// @notice The EIP-712 typehash for the contract's domain
    function DOMAIN_TYPEHASH() public view returns (bytes32) {
        return _DOMAIN_TYPEHASH();
    }

    /// @notice the EIP-712 typehash for approving token transfers via signature
    function PERMIT_TYPEHASH() public view returns (bytes32) {
        return _PERMIT_TYPEHASH();
    }

    /// @notice The underlying token that is deposited
    /// @return Underlying token address
    function underlying() public view override returns (address) {
        return _underlying();
    }

    /// @notice Get the underlying balance on the Bank
    /// @return Underlying token balance
    function underlyingBalance() public view override returns (uint256) {
        return IERC20(underlying()).balanceOf(address(this));
    }

    // Get the virtual balance invested in a given strategy (using index)
    function strategyBalance(uint256 i) public view override returns (uint256) {
        address strategy = strategies(i);
        return IStrategy(strategy).investedBalance();
    }

    // Get the total virtual amount invested in all strategies
    function investedBalance() public view override returns (uint256 amount) {
        uint256 length = totalStrategies();
        for (uint256 i = 0; i < length; i++) {
            amount = amount.add(strategyBalance(i));
        }
    }

    // Get the total virtual amount available to the bank
    function virtualBalance() public view override returns (uint256) {
        return underlyingBalance().add(investedBalance());
    }

    /// @notice The virtual price of each token
    /// @return The amount of underlying each token represents
    function virtualPrice() public view override returns (uint256) {
        uint256 totalSupply = totalSupply();
        uint256 unit = 10**decimals();
        return totalSupply == 0 ? unit : virtualBalance().mul(unit).div(totalSupply);
    }

    /// @notice Invest a given amount underlying into a given strategy
    function invest(address strategy, uint256 amount) external override onlyAuthorized {
        _invest(strategy, amount);
    }

    /// @notice Invest all available underlying into a given strategy
    function investAll(address strategy) external override onlyAuthorized {
        _invest(strategy, underlyingBalance());
    }

    /// @notice Exit and withdraw a given amount from a strategy
    function exit(address strategy, uint256 amount) external override onlyAuthorized {
        IStrategy(strategy).withdraw(amount);
    }

    /// @notice Exit a given strategy
    function exitAll(address strategy) external override onlyAuthorized {
        IStrategy(strategy).withdrawAll();
    }

    // deposit an amount of underlying
    function deposit(uint256 amount) external override defense {
        _deposit(amount, msg.sender, msg.sender);
    }

    // deposit an amount of underlying for a given recipient
    function depositFor(uint256 amount, address recipient) external override defense {
        require(recipient != address(0), "Bank: Invalid Recipient");
        _deposit(amount, msg.sender, recipient);
    }

    // withdraw an amount of shares for underlying
    function withdraw(uint256 shares) external override defense {
        _withdraw(msg.sender, shares);
    }

    function _invest(address strategy, uint256 amount) internal {
        if (amount == 0) {
            return;
        }
        OhTransferHelper.safeTokenTransfer(strategy, underlying(), amount);
        IStrategy(strategy).invest();
    }

    // deposit underlying to receive shares
    function _deposit(
        uint256 amount,
        address sender,
        address recipient
    ) internal {
        require(totalStrategies() > 0, "Bank: No Strategies");
        require(amount > 0, "Bank: Invalid Deposit");

        uint256 totalSupply = totalSupply();
        uint256 mintAmount =
            totalSupply == 0 ? amount : amount.mul(totalSupply).div(virtualBalance());

        _mint(recipient, mintAmount);
        IERC20(underlying()).transferFrom(sender, address(this), amount);

        emit Deposit(recipient, amount);
    }

    /// @dev Withdraw shares for underlying
    /// @dev 3 scenarios can occur
    /// @dev   1. If we have enough underlying on the Bank to cover the withdrawal, transfer from Bank
    /// @dev   2. Else if we are withdrawing all shares, withdraw all underlying tokens
    /// @dev   3. Else, transfer from each Strategy until the withdrawal is satisfied
    function _withdraw(address user, uint256 shares) internal {
        require(shares > 0, "Bank: Invalid withdrawal");
        uint256 totalSupply = totalSupply();
        _burn(user, shares);

        uint256 balance = underlyingBalance();
        uint256 withdrawAmount = virtualBalance().mul(shares).div(totalSupply);
        if (withdrawAmount > balance) {
            if (shares == totalSupply) {
                _withdrawAll();
            } else {
                _withdrawRemaining(withdrawAmount.sub(balance));
            }
        }

        OhTransferHelper.safeTokenTransfer(user, underlying(), withdrawAmount);
        emit Withdraw(user, shares);
    }

    // withdraw all underlying to the bank
    function _withdrawAll() internal {
        uint256 length = totalStrategies();
        for (uint256 i = 0; i < length; i++) {
            IStrategy(strategies(i)).withdrawAll();
        }
    }

    // withdraw from each strategy until remaining amount is reached
    function _withdrawRemaining(uint256 amount) internal {
        uint256 length = totalStrategies();
        for (uint256 i = 0; i < length; i++) {
            uint256 withdrawn = IStrategy(strategies(i)).withdraw(amount);
            if (withdrawn < amount) {
                amount = amount.sub(withdrawn);
            } else {
                return;
            }
        }
    }
}
