// SPDX-License-Identifier: MIT

// // SPDX-License-Identifier: MIT

// pragma solidity 0.7.6;
// pragma experimental ABIEncoderV2;

// import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
// import {IDocket} from "../interfaces/IDocket.sol";
// import {IForum} from "../interfaces/IForum.sol";
// import {IGovernor} from "../interfaces/IGovernor.sol";
// import {IRegistry} from "../interfaces/IRegistry.sol";
// import {IToken} from "../interfaces/IToken.sol";
// import {OhDataTypes} from "../libraries/OhDataTypes.sol";
// import {OhSubscriber} from "../registry/OhSubscriber.sol";
// import {OhSubscriberUpgradeable} from "../registry/OhSubscriberUpgradeable.sol";
// import {OhForumStorage} from "./OhForumStorage.sol";

// contract OhForumLogic is OhSubscriberUpgradeable, OhForumStorage {
//     using SafeMath for uint256;



//     // constructor(address registry_, address _token) OhSubscriber(registry_) {
//     //     uint256 chainId;

//     //     // solhint-disable-next-line no-inline-assembly
//     //     assembly {
//     //         chainId := chainid()
//     //     }

//     //     DOMAIN_SEPARATOR = keccak256(
//     //         abi.encode(DOMAIN_TYPEHASH, keccak256(bytes(name())), chainId, address(this))
//     //     );

//     //     token = _token;
//     // }

//     function acceptAdmin() public {
//         // require(
//         //     msg.sender == guardian,
//         //     "GovernorAlpha::__acceptAdmin: sender must be gov guardian"
//         // );
//         IGovernor(governance()).acceptAdmin();
//     }

//     function castVote(uint256 proposalId, bool support) public {
//         return _castVote(msg.sender, proposalId, support);
//     }

//     function castVoteBySig(
//         uint256 proposalId,
//         bool support,
//         uint8 v,
//         bytes32 r,
//         bytes32 s
//     ) public {
//         bytes32 digest =
//             keccak256(
//                 abi.encodePacked(
//                     "\x19\x01",
//                     // DOMAIN_SEPARATOR,
//                     keccak256(abi.encode(BALLOT_TYPEHASH, proposalId, support))
//                 )
//             );

//         address signatory = ecrecover(digest, v, r, s);
//         require(signatory != address(0), "Forum: Invalid Signature");
//         return _castVote(signatory, proposalId, support);
//     }

//     function cancel(uint256 proposalId) public {
//         require(!IDocket(docket).isExecuted(proposalId), "Forum: Proposal Already Executed");

//         (
//             address proposer,
//             uint256 eta,
//             address[] memory targets,
//             uint256[] memory values,
//             string[] memory signatures,
//             bytes[] memory calldatas,

//         ) = IDocket(docket).getProposal(proposalId);

//         require(
//             msg.sender == guardian ||
//                 msg.sender == proposer ||
//                 IToken(token).getPriorVotes(proposer, block.number.sub(1)) < proposalThreshold,
//             "Forum: Valid Proposer"
//         );

//         IDocket(docket).cancel(proposalId);
//         for (uint256 i = 0; i < targets.length; i++) {
//             IGovernor(governance()).cancelTransaction(
//                 targets[i],
//                 values[i],
//                 signatures[i],
//                 calldatas[i],
//                 eta
//             );
//         }
//     }

//     function execute(uint256 proposalId) public payable {
//         require(IDocket(docket).isQueued(proposalId), "Forum: Must Be Queued");

//         (
//             ,
//             uint256 eta,
//             address[] memory targets,
//             uint256[] memory values,
//             string[] memory signatures,
//             bytes[] memory calldatas,

//         ) = IDocket(docket).getProposal(proposalId);

//         IDocket(docket).execute(proposalId);
//         for (uint256 i = 0; i < targets.length; i++) {
//             IGovernor(governance()).executeTransaction{value: values[i]}(
//                 targets[i],
//                 values[i],
//                 signatures[i],
//                 calldatas[i],
//                 eta
//             );
//         }
//     }

//     function propose(
//         address[] memory targets,
//         uint256[] memory values,
//         string[] memory signatures,
//         bytes[] memory calldatas,
//         string memory description
//     ) public returns (uint256) {
//         require(
//             IToken(token).getPriorVotes(msg.sender, block.number.sub(1)) > proposalThreshold,
//             "Forum: Votes Below Threshold"
//         );
//         require(
//             targets.length == values.length &&
//                 targets.length == signatures.length &&
//                 targets.length == calldatas.length,
//             "Forum: Arity Mismatch"
//         );
//         require(targets.length != 0, "Forum: No Actions");
//         require(targets.length <= proposalMaxOperations, "Forum: Too Many Actions");
//         require(IDocket(docket).canPropose(msg.sender), "Forum: Invalid Proposer");

//         uint256 startBlock = block.number.add(votingDelay);
//         uint256 endBlock = startBlock.add(votingPeriod);

//         uint256 proposalId =
//             IDocket(docket).add(
//                 msg.sender,
//                 startBlock,
//                 endBlock,
//                 targets,
//                 values,
//                 signatures,
//                 calldatas
//             );

//         return proposalId;
//     }

//     function queue(uint256 proposalId) public {
//         require(IDocket(docket).isSucceeded(proposalId), "Forum: Only Successful Proposals");

//         (
//             address[] memory targets,
//             uint256[] memory values,
//             string[] memory signatures,
//             bytes[] memory calldatas
//         ) = IDocket(docket).getActions(proposalId);

//         uint256 eta = block.timestamp.add(IGovernor(governance()).delay());
//         for (uint256 i = 0; i < targets.length; i++) {
//             _queueOrRevert(targets[i], values[i], signatures[i], calldatas[i], eta);
//         }

//         IDocket(docket).queue(proposalId, eta);
//         emit ProposalQueued(proposalId, eta);
//     }

//     function name() public pure returns (string memory) {
//         return NAME;
//     }

//     function _castVote(
//         address voter,
//         uint256 proposalId,
//         bool support
//     ) internal {
//         require(IDocket(docket).isActive(proposalId), "Forum: Proposal Inactive");
//         require(IDocket(docket).canVote(voter, proposalId), "Forum: Already Voted");

//         (, , , , , , uint256 startBlock) = IDocket(docket).getProposal(proposalId);
//         uint256 votes = IToken(token).getPriorVotes(voter, startBlock);
//         IDocket(docket).vote(voter, proposalId, support, votes);

//         emit VoteCast(voter, proposalId, support, votes);
//     }

//     function _queueOrRevert(
//         address target,
//         uint256 value,
//         string memory signature,
//         bytes memory data,
//         uint256 eta
//     ) internal {
//         require(
//             !IGovernor(governance()).queuedTransactions(
//                 keccak256(abi.encode(target, value, signature, data, eta))
//             ),
//             "Forum: Proposal Already Queued"
//         );
//         IGovernor(governance()).queueTransaction(target, value, signature, data, eta);
//     }

//     // function queueSetTimelockPendingAdmin(address newPendingAdmin, uint256 eta) public {
//     //     require(
//     //         msg.sender == guardian,
//     //         "GovernorAlpha::__queueSetTimelockPendingAdmin: sender must be gov guardian"
//     //     );
//     //     timelock.queueTransaction(
//     //         address(timelock),
//     //         0,
//     //         "setPendingAdmin(address)",
//     //         abi.encode(newPendingAdmin),
//     //         eta
//     //     );
//     // }

//     // function executeSetTimelockPendingAdmin(address newPendingAdmin, uint256 eta) public {
//     //     require(
//     //         msg.sender == guardian,
//     //         "GovernorAlpha::__executeSetTimelockPendingAdmin: sender must be gov guardian"
//     //     );
//     //     timelock.executeTransaction(
//     //         address(timelock),
//     //         0,
//     //         "setPendingAdmin(address)",
//     //         abi.encode(newPendingAdmin),
//     //         eta
//     //     );
//     // }
// }
