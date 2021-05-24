// SPDX-License-Identifier: MIT

// pragma solidity 0.7.6;

// abstract contract OhForumStorage {
//     /// @notice The minimum setable proposal threshold
//     uint256 public constant MIN_PROPOSAL_THRESHOLD = 50000e18; // 50,000 Comp

//     /// @notice The maximum setable proposal threshold
//     uint256 public constant MAX_PROPOSAL_THRESHOLD = 100000e18; //100,000 Comp

//     /// @notice The minimum setable voting period
//     uint256 public constant MIN_VOTING_PERIOD = 5760; // About 24 hours

//     /// @notice The max setable voting period
//     uint256 public constant MAX_VOTING_PERIOD = 80640; // About 2 weeks

//     /// @notice The min setable voting delay
//     uint256 public constant MIN_VOTING_DELAY = 1;

//     /// @notice The max setable voting delay
//     uint256 public constant MAX_VOTING_DELAY = 40320; // About 1 week

//     /// @notice The number of votes in support of a proposal required in order for a quorum to be reached and for a vote to succeed
//     uint256 public constant quorumVotes = 4000000e18; // 4,000,000 = 4% supply

//     /// @notice The maximum number of actions that can be included in a proposal
//     uint256 public constant proposalMaxOperations = 10; // 10 actions

//     /// @notice The EIP-712 typehash for the ballot struct used by the contract
//     bytes32 public constant BALLOT_TYPEHASH = keccak256("Ballot(uint256 proposalId,bool support)");

//     /// @notice The EIP-712 typehash for the contract's domain
//     bytes32 public constant DOMAIN_TYPEHASH =
//         keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)");

//     // bytes32 public immutable DOMAIN_SEPARATOR;

//     string internal constant NAME = "Oh! Forum V1";

//     /// @notice The address of the Proposal Docket
//     address public docket;

//     /// @notice The address of Oh! Protocol Guardian
//     address public guardian;

//     /// @notice The address of the Oh! Finance Token
//     address public token;

//     /// @notice The delay before voting on a proposal may take place, once proposed, in blocks
//     uint256 public votingDelay;

//     /// @notice The duration of voting on a proposal, in blocks
//     uint256 public votingPeriod;

//     /// @notice The number of votes required in order for a voter to become a proposer
//     uint256 public proposalThreshold;
// }
