// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity 0.8.20;

import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title Timelock
 * @dev This contract extends the OpenZeppelin TimelockController to manage time-locked operations.
 * The timelock ensures a delay period before executing critical operations, enhancing governance security.
 */
contract Timelock is TimelockController {
    /**
     * @dev Constructor that initializes the TimelockController with the specified parameters.
     * @param minDelay The minimum delay before an operation can be executed.
     * @param proposers The list of addresses that can propose operations.
     * @param executors The list of addresses that can execute operations.
     * @param admin The address of the admin that can manage the timelock.
     */
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {}
}
