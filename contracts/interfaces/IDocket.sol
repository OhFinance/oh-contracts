// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

interface IDocket {
    function add(
        address proposer,
        uint256 startBlock,
        uint256 endBlock,
        address[] memory targets,
        uint256[] memory values,
        string[] memory signatures,
        bytes[] memory calldatas
    ) external returns (uint256 proposalId);

    function cancel(uint256 proposalId) external;

    function execute(uint256 proposalId) external;

    function queue(uint256 proposalId, uint256 eta) external;

    function vote(
        address user,
        uint256 proposalId,
        bool support,
        uint256 votes
    ) external;

    function canPropose(address user) external view returns (bool);

    function canVote(address user, uint256 proposalId) external view returns (bool);

    function getActions(uint256 proposalId)
        external
        view
        returns (
            address[] memory targets,
            uint256[] memory values,
            string[] memory signatures,
            bytes[] memory calldatas
        );

    function getProposal(uint256 proposalId)
        external
        view
        returns (
            address proposer,
            uint256 eta,
            address[] memory targets,
            uint256[] memory values,
            string[] memory signatures,
            bytes[] memory calldatas,
            uint256 startBlock
        );

    function getReceipt(uint256 proposalId, address voter)
        external
        view
        returns (
            bool hasVoted,
            bool support,
            uint256 votes
        );

    function isActive(uint256 proposalId) external view returns (bool);

    function isSucceeded(uint256 proposalId) external view returns (bool);

    function isExecuted(uint256 proposalId) external view returns (bool);

    function isQueued(uint256 proposalId) external view returns (bool);
}
