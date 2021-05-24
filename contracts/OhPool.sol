// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {IPool} from "./interfaces/IPool.sol";
import {OhSubscriber} from "./registry/OhSubscriber.sol";

/// @title Oh! Finance Pool
/// @notice Protocol Incentive Staking/Distribution Contract
contract OhPool is IPool, OhSubscriber {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    // Info of each user.
    struct UserInfo {
        uint256 amount; // How many LP tokens the user has provided.
        uint256 rewardDebt; // Reward debt. See explanation below.
        //
        // We do some fancy math here. Basically, any point in time, the amount of SUSHIs
        // entitled to a user but is pending to be distributed is:
        //
        //   pending reward = (user.amount * pool.accTokenPerShare) - user.rewardDebt
        //
        // Whenever a user deposits or withdraws LP tokens to a pool. Here's what happens:
        //   1. The pool's `accTokenPerShare` (and `lastRewardBlock`) gets updated.
        //   2. User receives the pending reward sent to his/her address.
        //   3. User's `amount` gets updated.
        //   4. User's `rewardDebt` gets updated.
    }

    // Info of each pool.
    struct PoolInfo {
        uint256 accTokenPerShare; // Accumulated SUSHIs per share, times 1e12. See below.
        uint256 lastRewardBlock; // Last block number that SUSHIs distribution occurs.
        uint256 allocPoint; // How many allocation points assigned to this pool. SUSHIs to distribute per block.
    }

    // The Oh TOKEN!
    IERC20 public token;
    // OH tokens created per block.
    uint256 public tokenPerBlock;

    // Info of each pool.
    PoolInfo[] public poolInfo;
    //
    IERC20[] public lpTokens;

    // Info of each user that stakes LP tokens.
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    // Total allocation poitns. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint;
    // The block number when SUSHI mining starts.
    uint256 public startBlock;

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount);

    constructor(
        address registry_,
        IERC20 _token,
        uint256 _tokenPerBlock,
        uint256 _startBlock
    ) OhSubscriber(registry_) {
        token = _token;
        tokenPerBlock = _tokenPerBlock;
        startBlock = _startBlock;
    }

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    // Add a new lp to the pool. Can only be called by the owner.
    // XXX DO NOT add the same LP token more than once. Rewards will be messed up if you do.
    function add(uint256 _allocPoint, IERC20 _lpToken) public onlyGovernance {
        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        poolInfo.push(
            PoolInfo({
                allocPoint: _allocPoint,
                lastRewardBlock: lastRewardBlock,
                accTokenPerShare: 0
            })
        );

        lpTokens.push(_lpToken);
    }

    /// @notice Update the given pool's SUSHI allocation point contract. Can only be called by the owner.
    /// @param _pid The index of the pool. See `poolInfo`.
    /// @param _allocPoint New AP of the pool.
    function set(uint256 _pid, uint256 _allocPoint) public onlyGovernance {
        totalAllocPoint = totalAllocPoint.sub(poolInfo[_pid].allocPoint).add(_allocPoint);
        poolInfo[_pid].allocPoint = _allocPoint;
        // emit LogSetPool(_pid, _allocPoint, overwrite ? _rewarder : rewarder[_pid], overwrite);
    }

    /// @notice View function to see pending SUSHI on frontend.
    /// @param _pid The index of the pool. See `poolInfo`.
    /// @param _user Address of user.
    /// @return pending SUSHI reward for a given user.
    function pendingSushi(uint256 _pid, address _user) external view returns (uint256 pending) {
        PoolInfo memory pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accTokenPerShare = pool.accTokenPerShare;
        uint256 lpSupply = lpTokens[_pid].balanceOf(address(this));
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint256 blocks = block.number.sub(pool.lastRewardBlock);
            uint256 sushiReward = blocks.mul(tokenPerBlock).mul(pool.allocPoint) / totalAllocPoint;
            accTokenPerShare = accTokenPerShare.add(sushiReward.mul(1e12) / lpSupply);
        }
        pending = user.amount.mul(accTokenPerShare).div(1e12).sub(user.rewardDebt);
    }

    /// @notice Update reward variables for all pools. Be careful of gas spending!
    /// @param pids Pool IDs of all to be updated. Make sure to update all active pools.
    function massUpdatePools(uint256[] calldata pids) external {
        uint256 len = pids.length;
        for (uint256 i = 0; i < len; ++i) {
            updatePool(pids[i]);
        }
    }

    /// @notice Update reward variables of the given pool.
    /// @param pid The index of the pool. See `poolInfo`.
    /// @return pool Returns the pool that was updated.
    function updatePool(uint256 pid) public returns (PoolInfo memory pool) {
        pool = poolInfo[pid];
        if (block.number > pool.lastRewardBlock) {
            uint256 lpSupply = lpTokens[pid].balanceOf(address(this));
            if (lpSupply > 0) {
                uint256 blocks = block.number.sub(pool.lastRewardBlock);
                uint256 tokenReward =
                    blocks.mul(tokenPerBlock).mul(pool.allocPoint) / totalAllocPoint;
                pool.accTokenPerShare = pool.accTokenPerShare.add(
                    (tokenReward.mul(1e12).div(lpSupply))
                );
            }
            pool.lastRewardBlock = block.number;
            poolInfo[pid] = pool;
            // emit LogUpdatePool(pid, pool.lastRewardBlock, lpSupply, pool.accTokenPerShare);
        }
    }

    /// @notice Deposit LP tokens to MCV2 for SUSHI allocation.
    /// @param pid The index of the pool. See `poolInfo`.
    /// @param amount LP token amount to deposit.
    /// @param to The receiver of `amount` deposit benefit.
    function deposit(
        uint256 pid,
        uint256 amount,
        address to
    ) public {
        PoolInfo memory pool = updatePool(pid);
        UserInfo storage user = userInfo[pid][to];

        // Effects
        user.amount = user.amount.add(amount);
        user.rewardDebt = user.rewardDebt.add(amount.mul(pool.accTokenPerShare).div(1e12));

        // Interactions
        lpTokens[pid].safeTransferFrom(msg.sender, address(this), amount);

        // emit Deposit(msg.sender, pid, amount, to);
    }

    /// @notice Withdraw LP tokens from MCV2.
    /// @param pid The index of the pool. See `poolInfo`.
    /// @param amount LP token amount to withdraw.
    /// @param to Receiver of the LP tokens.
    function withdraw(
        uint256 pid,
        uint256 amount,
        address to
    ) public {
        PoolInfo memory pool = updatePool(pid);
        UserInfo storage user = userInfo[pid][msg.sender];

        // Effects
        user.rewardDebt = user.rewardDebt.sub(amount.mul(pool.accTokenPerShare).div(1e12));
        user.amount = user.amount.sub(amount);

        // Interactions
        lpTokens[pid].safeTransfer(to, amount);

        // emit Withdraw(msg.sender, pid, amount, to);
    }

    /// @notice Harvest proceeds for transaction sender to `to`.
    /// @param pid The index of the pool. See `poolInfo`.
    /// @param to Receiver of SUSHI rewards.
    /// @return success Returns bool indicating success of rewarder delegate call.
    function harvest(uint256 pid, address to) public returns (bool success) {
        PoolInfo memory pool = updatePool(pid);
        UserInfo storage user = userInfo[pid][msg.sender];
        uint256 _pendingRewards =
            user.amount.mul(pool.accTokenPerShare).div(1e12).sub(user.rewardDebt);
        if (_pendingRewards == 0) {
            success = false;
        }

        // Effects
        user.rewardDebt = _pendingRewards;

        // Interactions
        safeTokenTransfer(to, _pendingRewards);

        // emit Harvest(msg.sender, pid, _pendingSushi);
    }

    /// @notice Withdraw without caring about rewards. EMERGENCY ONLY.
    /// @param pid The index of the pool. See `poolInfo`.
    /// @param to Receiver of the LP tokens.
    function emergencyWithdraw(uint256 pid, address to) public {
        UserInfo storage user = userInfo[pid][msg.sender];
        uint256 amount = user.amount;
        user.amount = 0;
        user.rewardDebt = 0;
        // Note: transfer can fail or succeed if `amount` is zero.
        lpTokens[pid].safeTransfer(to, amount);
        // emit EmergencyWithdraw(msg.sender, pid, amount, to);
    }

    function safeTokenTransfer(address to, uint256 amount) internal {
        uint256 balance = token.balanceOf(address(this));
        if (amount > balance) {
            token.safeTransfer(to, balance);
        } else {
            token.safeTransfer(to, amount);
        }
    }
}
