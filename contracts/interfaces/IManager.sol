// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface IManager {
    function banks(address bank) external view returns (bool);

    function liquidators(address from, address to) external view returns (address);

    function whitelisted(address _contract) external view returns (bool);

    function buybackFee() external view returns (uint256);

    function managementFee() external view returns (uint256);

    function strategies(address bank, uint256 i) external view returns (address);

    function totalStrategies(address bank) external view returns (uint256);
}
