// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {OhTransferHelper} from "./libraries/OhTransferHelper.sol";
import {OhSubscriber} from "./registry/OhSubscriber.sol";

contract OhTimelock is OhSubscriber {
    using SafeMath for uint256;

    mapping(address => uint256) public balances;

    mapping(address => uint256) public totalClaimed;

    mapping(address => uint256) public lastClaim;

    address public token;

    uint256 public timelockStart;

    uint256 public timelockLength;

    constructor(
        address registry_,
        address _token,
        uint256 _timelockLength
    ) OhSubscriber(registry_) {
        token = _token;
        timelockStart = block.timestamp;
        timelockLength = _timelockLength;
    }

    function claimable(address user) public view returns (uint256 amount) {
        // save state variable to memory
        uint256 userLastClaim = lastClaim[user];
        uint256 userClaimed = totalClaimed[user];

        if (block.timestamp > timelockStart.add(timelockLength)) {
            // if timelock has expired, return remaining balance
            amount = balances[user];
        } else {
            // find time passed since last claim relative to timelockLength, scale by 1e12 to prevent underflow
            uint256 lastClaimTimestamp = userLastClaim == 0 ? timelockStart : userLastClaim;
            uint256 delta = block.timestamp.sub(lastClaimTimestamp).mul(1e12);
            uint256 deltaRatio = delta.div(timelockLength);

            // find the total amount of tokens claimable by the user
            uint256 userTotalAmount = balances[user].add(userClaimed);
            uint256 userTotalOwed = userTotalAmount.mul(deltaRatio);
            amount = userTotalOwed.div(1e12).sub(userClaimed);
        }
    }

    function claim() external {
        uint256 amount = claimable(msg.sender);
        require(amount > 0, "Timelock: No Tokens");

        OhTransferHelper.safeTokenTransfer(msg.sender, token, amount);

        balances[msg.sender].sub(amount);
        totalClaimed[msg.sender].add(amount);
        lastClaim[msg.sender] = block.timestamp;
    }

    function add(address[] memory users, uint256[] memory amounts) external onlyGovernance {
        uint256 length = users.length;
        for (uint256 i; i < length; i++) {
            balances[users[i]] = amounts[i];
        }
    }
}
