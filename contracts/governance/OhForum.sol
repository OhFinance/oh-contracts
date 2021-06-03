// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {IForum} from "../interfaces/IForum.sol";
import {IGovernor} from "../interfaces/IGovernor.sol";
import {IRegistry} from "../interfaces/IRegistry.sol";
import {IToken} from "../interfaces/IToken.sol";
import {OhSubscriber} from "../registry/OhSubscriber.sol";
import {OhForumTypes} from "./OhForumTypes.sol";

/// @title Oh! Finance Forum
/// @notice Manages Protocol proposals and voting receipts to send to the Governor
/// @dev Proposer-Executor Relationship to execute protocol changes
contract OhForum is OhSubscriber, OhForumTypes {
    using SafeMath for uint256;

    /// @notice Contract Name
    string public constant name = "Oh! Forum";

    /// @notice The maximum number of actions that can be included in a proposal
    uint256 public constant MAX_OPERATIONS = 10;

    /// @notice The minimum setable proposal threshold
    uint256 public constant MIN_PROPOSAL_THRESHOLD = 500000e18; // 500,000 = 0.5%

    /// @notice The maximum setable proposal threshold
    uint256 public constant MAX_PROPOSAL_THRESHOLD = 5000000e18; // 5,000,000 = 5%

    /// @notice The minimum setable voting period
    uint256 public constant MIN_VOTING_PERIOD = 5760; // About 24 hours

    /// @notice The max setable voting period
    uint256 public constant MAX_VOTING_PERIOD = 80640; // About 2 weeks

    /// @notice The min setable voting delay
    uint256 public constant MIN_VOTING_DELAY = 1;

    /// @notice The max setable voting delay
    uint256 public constant MAX_VOTING_DELAY = 40320; // About 1 week

    /// @notice The number of votes in support of a proposal required in order for a quorum to be reached and for a vote to succeed
    uint256 public constant QUORUM_VOTES = 4000000e18; // 4,000,000 = 4%

    /// @notice The EIP-712 typehash for the ballot struct used by the contract
    bytes32 public constant BALLOT_TYPEHASH = keccak256("Ballot(uint256 proposalId,bool support)");

    /// @notice The EIP-712 typehash for the contract's domain
    bytes32 public constant DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    bytes32 public immutable DOMAIN_SEPARATOR;

    /// @notice The address of Oh! Protocol Guardian
    address public guardian;

    /// @notice The address of the Oh! Finance Token
    address public token;

    /// @notice The delay before voting on a proposal may take place, once proposed, in blocks
    uint256 public votingDelay;

    /// @notice The duration of voting on a proposal, in blocks
    uint256 public votingPeriod;

    /// @notice The number of votes required in order for a voter to become a proposer
    uint256 public proposalThreshold;

    /// @notice The total number of proposals
    uint256 public proposalCount;

    /// @notice The official record of all proposals ever proposed
    mapping(uint256 => Proposal) public proposals;

    /// @notice Mapping of proposal to receipts of ballots for the entire set of voters
    mapping(uint256 => mapping(address => Receipt)) public receipts;

    /// @notice The latest proposal for each proposer
    mapping(address => uint256) public latestProposalIds;

    /// @notice An event emitted when a new proposal is created
    event ProposalAdded(
        uint256 id,
        address proposer,
        address[] targets,
        uint256[] values,
        string[] signatures,
        bytes[] calldatas,
        uint256 startBlock,
        uint256 endBlock,
        string description
    );

    /// @notice An event emitted when a proposal has been canceled
    event ProposalCancelled(uint256 id);

    /// @notice An event emitted when a proposal has been executed in the Timelock
    event ProposalExecuted(uint256 id);

    /// @notice An event emitted when a proposal has been queued in the Timelock
    event ProposalQueued(uint256 id, uint256 eta);

    /// @notice An event emitted when a vote has been cast on a proposal
    event VoteCast(address voter, uint256 proposalId, bool support, uint256 votes);

    /// @notice Only allow guardian to execute function
    modifier onlyGuardian {
        require(msg.sender == guardian, "Forum: Only Guardian");
        _;
    }

    constructor(
        address registry_,
        address _token,
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _proposalThreshold
    ) OhSubscriber(registry_) {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(DOMAIN_TYPEHASH, keccak256(bytes(name)), keccak256(bytes("1")), getChainId(), address(this))
        );

        guardian = msg.sender;
        token = _token;
        votingDelay = _votingDelay;
        votingPeriod = _votingPeriod;
        proposalThreshold = _proposalThreshold;
    }

    function castVote(uint256 proposalId, bool support) external {
        return _castVote(msg.sender, proposalId, support);
    }

    function castVoteBySig(
        uint256 proposalId,
        bool support,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        bytes32 digest =
            keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, keccak256(abi.encode(BALLOT_TYPEHASH, proposalId, support))));

        address signatory = ecrecover(digest, v, r, s);
        require(signatory != address(0), "Forum: Invalid Signature");
        return _castVote(signatory, proposalId, support);
    }

    function propose(
        address[] memory targets,
        uint256[] memory values,
        string[] memory signatures,
        bytes[] memory calldatas,
        string memory description
    ) external returns (uint256) {
        require(IToken(token).getPriorVotes(msg.sender, block.number.sub(1)) > proposalThreshold, "Forum: Votes Below Threshold");
        require(
            targets.length == values.length && targets.length == signatures.length && targets.length == calldatas.length,
            "Forum: Arity Mismatch"
        );
        require(targets.length != 0, "Forum: No Actions");
        require(targets.length <= MAX_OPERATIONS, "Forum: Too Many Actions");

        uint256 latestProposalId = latestProposalIds[msg.sender];
        if (latestProposalId != 0) {
            ProposalState latestProposalState = state(latestProposalId);
            require(latestProposalState != ProposalState.Active, "Forum: Proposal Already Active");
            require(latestProposalState != ProposalState.Pending, "Forum: Proposal Already Pending");
        }

        uint256 startBlock = block.number.add(votingDelay);
        uint256 endBlock = startBlock.add(votingPeriod);

        proposalCount++;
        Proposal memory newProposal =
            Proposal({
                id: proposalCount,
                proposer: msg.sender,
                eta: 0,
                targets: targets,
                values: values,
                signatures: signatures,
                calldatas: calldatas,
                startBlock: startBlock,
                endBlock: endBlock,
                forVotes: 0,
                againstVotes: 0,
                cancelled: false,
                executed: false
            });

        proposals[newProposal.id] = newProposal;
        latestProposalIds[newProposal.proposer] = newProposal.id;

        emit ProposalAdded(newProposal.id, msg.sender, targets, values, signatures, calldatas, startBlock, endBlock, description);
        return newProposal.id;
    }

    function queue(uint256 proposalId) external {
        require(state(proposalId) == ProposalState.Succeeded, "Forum: Only Successful Proposals");
        Proposal storage proposal = proposals[proposalId];
        uint256 eta = block.timestamp.add(IGovernor(governance()).delay());
        for (uint256 i = 0; i < proposal.targets.length; i++) {
            _queueOrRevert(proposal.targets[i], proposal.values[i], proposal.signatures[i], proposal.calldatas[i], eta);
        }
        proposal.eta = eta;
        emit ProposalQueued(proposalId, eta);
    }

    function execute(uint256 proposalId) external payable {
        require(state(proposalId) == ProposalState.Queued, "Forum: Must Be Queued");
        Proposal storage proposal = proposals[proposalId];
        proposal.executed = true;
        for (uint256 i = 0; i < proposal.targets.length; i++) {
            IGovernor(governance()).executeTransaction{value: proposal.values[i]}(
                proposal.targets[i],
                proposal.values[i],
                proposal.signatures[i],
                proposal.calldatas[i],
                proposal.eta
            );
        }
        emit ProposalExecuted(proposalId);
    }

    function cancel(uint256 proposalId) external {
        require(state(proposalId) != ProposalState.Executed, "Forum: Proposal Already Executed");

        Proposal storage proposal = proposals[proposalId];
        require(
            msg.sender == guardian ||
                msg.sender == proposal.proposer ||
                IToken(token).getPriorVotes(proposal.proposer, block.number.sub(1)) < proposalThreshold,
            "Forum: Valid Proposer"
        );

        proposal.cancelled = true;
        for (uint256 i = 0; i < proposal.targets.length; i++) {
            IGovernor(governance()).cancelTransaction(
                proposal.targets[i],
                proposal.values[i],
                proposal.signatures[i],
                proposal.calldatas[i],
                proposal.eta
            );
        }

        emit ProposalCancelled(proposalId);
    }

    function setProposalThreshold(uint256 _proposalThreshold) external onlyGovernance {
        require(_proposalThreshold >= MIN_PROPOSAL_THRESHOLD, "Forum: Threshold Too Low");
        require(_proposalThreshold <= MAX_PROPOSAL_THRESHOLD, "Forum: Threshold Too High");
        proposalThreshold = _proposalThreshold;
    }

    function setVotingDelay(uint256 _votingDelay) external onlyGovernance {
        require(_votingDelay >= MIN_VOTING_DELAY, "Forum: Delay Too Low");
        require(_votingDelay <= MAX_VOTING_DELAY, "Forum: Delay Too High");
        votingDelay = _votingDelay;
    }

    function setVotingPeriod(uint256 _votingPeriod) external onlyGovernance {
        require(_votingPeriod >= MIN_VOTING_PERIOD, "Forum: Period Too Low");
        require(_votingPeriod <= MAX_VOTING_PERIOD, "Forum: Period Too High");
        votingPeriod = _votingPeriod;
    }

    function acceptAdmin() external onlyGuardian {
        IGovernor(governance()).acceptAdmin();
    }

    function abdicate() external onlyGuardian {
        guardian = address(0);
    }

    function queueSetGovernorPendingAdmin(address newPendingAdmin, uint256 eta) external onlyGuardian {
        IGovernor(governance()).queueTransaction(governance(), 0, "setPendingAdmin(address)", abi.encode(newPendingAdmin), eta);
    }

    function executeSetGovernorPendingAdmin(address newPendingAdmin, uint256 eta) external onlyGuardian {
        IGovernor(governance()).executeTransaction(governance(), 0, "setPendingAdmin(address)", abi.encode(newPendingAdmin), eta);
    }

    function getActions(uint256 proposalId)
        external
        view
        returns (
            address[] memory targets,
            uint256[] memory values,
            string[] memory signatures,
            bytes[] memory calldatas
        )
    {
        Proposal storage p = proposals[proposalId];
        return (p.targets, p.values, p.signatures, p.calldatas);
    }

    function getReceipt(uint256 proposalId, address voter) external view returns (Receipt memory) {
        return receipts[proposalId][voter];
    }

    function state(uint256 proposalId) public view returns (ProposalState) {
        require(proposalCount >= proposalId && proposalId > 0, "Forum: Invalid Proposal ID");

        Proposal storage proposal = proposals[proposalId];
        if (proposal.cancelled) {
            return ProposalState.Cancelled;
        } else if (block.number <= proposal.startBlock) {
            return ProposalState.Pending;
        } else if (block.number <= proposal.endBlock) {
            return ProposalState.Active;
        } else if (proposal.forVotes <= proposal.againstVotes || proposal.forVotes < QUORUM_VOTES) {
            return ProposalState.Defeated;
        } else if (proposal.eta == 0) {
            return ProposalState.Succeeded;
        } else if (proposal.executed) {
            return ProposalState.Executed;
        } else if (block.timestamp >= proposal.eta.add(IGovernor(governance()).GRACE_PERIOD())) {
            return ProposalState.Expired;
        } else {
            return ProposalState.Queued;
        }
    }

    function _castVote(
        address voter,
        uint256 proposalId,
        bool support
    ) internal {
        require(state(proposalId) == ProposalState.Active, "Forum: Proposal Inactive");

        Proposal storage proposal = proposals[proposalId];
        Receipt storage receipt = receipts[proposalId][voter];
        require(receipt.hasVoted == false, "Forum: Already Voted");

        uint256 votes = IToken(token).getPriorVotes(voter, proposal.startBlock);
        if (support) {
            proposal.forVotes = proposal.forVotes.add(votes);
        } else {
            proposal.againstVotes = proposal.againstVotes.add(votes);
        }

        receipt.hasVoted = true;
        receipt.support = support;
        receipt.votes = votes;

        emit VoteCast(voter, proposalId, support, votes);
    }

    function _queueOrRevert(
        address target,
        uint256 value,
        string memory signature,
        bytes memory data,
        uint256 eta
    ) internal {
        require(
            !IGovernor(governance()).queuedTransactions(keccak256(abi.encode(target, value, signature, data, eta))),
            "Forum: Proposal Already Queued"
        );
        IGovernor(governance()).queueTransaction(target, value, signature, data, eta);
    }

    function getChainId() internal pure returns (uint256 chainId) {
        // solhint-disable-next-line no-inline-assembly
        assembly {
            chainId := chainid()
        }
    }
}
