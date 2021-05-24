// SPDX-License-Identifier: MIT

// // SPDX-License-Identifier: MIT

// pragma solidity 0.7.6;
// pragma experimental ABIEncoderV2;

// import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
// import {IForum} from "../interfaces/IForum.sol";
// import {IGovernor} from "../interfaces/IGovernor.sol";
// import {IRegistry} from "../interfaces/IRegistry.sol";
// import {IDocket} from "../interfaces/IDocket.sol";
// import {IToken} from "../interfaces/IToken.sol";
// import {OhSubscriber} from "../registry/OhSubscriber.sol";

// contract OhDocket is IDocket, OhSubscriber {
//     using SafeMath for uint256;

//     /// @notice Possible states that a proposal may be in
//     enum ProposalState {Pending, Active, Cancelled, Defeated, Succeeded, Queued, Expired, Executed}

//     /// @notice Proposal object used to execute a series of instructions
//     struct Proposal {
//         // Unique id for looking up a proposal
//         uint256 id;
//         // Creator of the proposal
//         address proposer;
//         // The timestamp that the proposal will be available for execution, set once the vote succeeds
//         uint256 eta;
//         // the ordered list of target addresses for calls to be made
//         address[] targets;
//         // The ordered list of values (i.e. msg.value) to be passed to the calls to be made
//         uint256[] values;
//         // The ordered list of function signatures to be called
//         string[] signatures;
//         // The ordered list of calldata to be passed to each call
//         bytes[] calldatas;
//         // The block at which voting begins: holders must delegate their votes prior to this block
//         uint256 startBlock;
//         // The block at which voting ends: votes must be cast prior to this block
//         uint256 endBlock;
//         // Current number of votes in favor of this proposal
//         uint256 forVotes;
//         // Current number of votes in opposition to this proposal
//         uint256 againstVotes;
//         // Flag marking whether the proposal has been canceled
//         bool cancelled;
//         // Flag marking whether the proposal has been executed
//         bool executed;
//     }

//     /// @notice Ballot receipt record for a voter
//     struct Receipt {
//         // Whether or not a vote has been cast
//         bool hasVoted;
//         // Whether or not the voter supports the proposal
//         bool support;
//         // The number of votes the voter had, which were cast
//         uint256 votes;
//     }

//     /// @notice The official record of all proposals ever proposed
//     mapping(uint256 => Proposal) public proposals;

//     /// @notice Mapping of proposal to receipts of ballots for the entire set of voters
//     mapping(uint256 => mapping(address => Receipt)) public receipts;

//     /// @notice The latest proposal for each proposer
//     mapping(address => uint256) public latestProposalIds;

//     /// @notice The address of the Forum
//     address public forum;

//     /// @notice The total number of proposals
//     uint256 public proposalCount;

//     /// @notice An event emitted when a vote has been cast on a proposal
//     event VoteCast(address voter, uint256 proposalId, bool support, uint256 votes);

//     /// @notice An event emitted when a proposal has been canceled
//     event ProposalCancelled(uint256 id);

//     /// @notice An event emitted when a proposal has been queued in the Timelock
//     event ProposalQueued(uint256 id, uint256 eta);

//     /// @notice An event emitted when a proposal has been executed in the Timelock
//     event ProposalExecuted(uint256 id);

//     /// @notice An event emitted when a new proposal is created
//     event ProposalCreated(
//         uint256 id,
//         address proposer,
//         address[] targets,
//         uint256[] values,
//         string[] signatures,
//         bytes[] calldatas,
//         uint256 startBlock,
//         uint256 endBlock,
//         string description
//     );

//     modifier onlyForum {
//         require(msg.sender == forum, "Docket: Only Forum");
//         _;
//     }

//     constructor(address registry_, address _forum) OhSubscriber(registry_) {
//         forum = _forum;
//     }

//     function add(
//         address proposer,
//         uint256 startBlock,
//         uint256 endBlock,
//         address[] memory targets,
//         uint256[] memory values,
//         string[] memory signatures,
//         bytes[] memory calldatas
//     ) external override onlyForum returns (uint256) {
//         proposalCount++;
//         Proposal memory newProposal =
//             Proposal({
//                 id: proposalCount,
//                 proposer: proposer,
//                 eta: 0,
//                 targets: targets,
//                 values: values,
//                 signatures: signatures,
//                 calldatas: calldatas,
//                 startBlock: startBlock,
//                 endBlock: endBlock,
//                 forVotes: 0,
//                 againstVotes: 0,
//                 cancelled: false,
//                 executed: false
//             });
//         proposals[newProposal.id] = newProposal;
//         latestProposalIds[newProposal.proposer] = newProposal.id;
//         emit ProposalCreated(
//             newProposal.id,
//             msg.sender,
//             targets,
//             values,
//             signatures,
//             calldatas,
//             startBlock,
//             endBlock,
//             description
//         );

//         return newProposal.id;
//     }

//     function cancel(uint256 proposalId) external override onlyForum {
//         proposals[proposalId].cancelled = true;
//         emit ProposalCancelled(proposalId);
//     }

//     function execute(uint256 proposalId) external override onlyForum {
//         proposals[proposalId].executed = true;
//         emit ProposalExecuted(proposalId);
//     }

//     function queue(uint256 proposalId, uint256 eta) external override onlyForum {
//         proposals[proposalId].eta = eta;
//     }

//     function vote(
//         address user,
//         uint256 proposalId,
//         bool support,
//         uint256 votes
//     ) external override onlyForum {
//         Proposal storage proposal = proposals[proposalId];
//         Receipt storage receipt = receipts[proposalId][user];

//         if (support) {
//             proposal.forVotes = proposal.forVotes.add(votes);
//         } else {
//             proposal.againstVotes = proposal.againstVotes.add(votes);
//         }

//         receipt.hasVoted = true;
//         receipt.support = support;
//         receipt.votes = votes;
//     }

//     /// @notice Validates that there is only one active / pending proposal per user
//     function canPropose(address user) public view override returns (bool) {
//         uint256 latestProposalId = latestProposalIds[user];
//         if (latestProposalId != 0) {
//             ProposalState proposersLatestProposalState = state(latestProposalId);
//             if (
//                 proposersLatestProposalState == ProposalState.Active ||
//                 proposersLatestProposalState == ProposalState.Pending
//             ) {
//                 return false;
//             }
//         }
//         return true;
//     }

//     /// @notice Validates that user only votes once per proposal
//     function canVote(address user, uint256 proposalId) public view override returns (bool) {
//         return !receipts[proposalId][user].hasVoted;
//     }

//     function getActions(uint256 proposalId)
//         public
//         view
//         override
//         returns (
//             address[] memory targets,
//             uint256[] memory values,
//             string[] memory signatures,
//             bytes[] memory calldatas
//         )
//     {
//         Proposal storage p = proposals[proposalId];
//         return (p.targets, p.values, p.signatures, p.calldatas);
//     }

//     function getProposal(uint256 proposalId)
//         public
//         view
//         override
//         returns (
//             address proposer,
//             uint256 eta,
//             address[] memory targets,
//             uint256[] memory values,
//             string[] memory signatures,
//             bytes[] memory calldatas,
//             uint256 startBlock
//         )
//     {
//         Proposal storage p = proposals[proposalId];
//         return (p.proposer, p.eta, p.targets, p.values, p.signatures, p.calldatas, p.startBlock);
//     }

//     function getReceipt(uint256 proposalId, address voter)
//         public
//         view
//         override
//         returns (
//             bool hasVoted,
//             bool support,
//             uint256 votes
//         )
//     {
//         Receipt storage r = receipts[proposalId][voter];
//         return (r.hasVoted, r.support, r.votes);
//     }

//     function isActive(uint256 proposalId) public view override returns (bool) {
//         return state(proposalId) == ProposalState.Active;
//     }

//     function isSucceeded(uint256 proposalId) public view override returns (bool) {
//         return state(proposalId) == ProposalState.Succeeded;
//     }

//     function isExecuted(uint256 proposalId) public view override returns (bool) {
//         return state(proposalId) == ProposalState.Executed;
//     }

//     function isQueued(uint256 proposalId) public view override returns (bool) {
//         return state(proposalId) == ProposalState.Queued;
//     }

//     function state(uint256 proposalId) internal view returns (ProposalState) {
//         require(proposalCount >= proposalId && proposalId > 0, "Forum: Invalid Proposal ID");

//         Proposal storage proposal = proposals[proposalId];
//         if (proposal.cancelled) {
//             return ProposalState.Cancelled;
//         } else if (block.number <= proposal.startBlock) {
//             return ProposalState.Pending;
//         } else if (block.number <= proposal.endBlock) {
//             return ProposalState.Active;
//             // } else if (proposal.forVotes <= proposal.againstVotes || proposal.forVotes < quorumVotes) {
//             //     return ProposalState.Defeated;
//         } else if (proposal.eta == 0) {
//             return ProposalState.Succeeded;
//         } else if (proposal.executed) {
//             return ProposalState.Executed;
//         } else if (block.timestamp >= proposal.eta.add(IGovernor(governance()).GRACE_PERIOD())) {
//             return ProposalState.Expired;
//         } else {
//             return ProposalState.Queued;
//         }
//     }
// }
