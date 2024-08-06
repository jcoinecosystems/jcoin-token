// SPDX-License-Identifier: GPL-3.0-or-later
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity 0.8.20;

import "./JcoinTestV2.sol";

/**
 * @title JcoinTestV3
 * @dev This contract extends the JcoinTestV2 contract for testing purposes.
 * It includes an additional state variable and a method to access it.
 */
contract JcoinTestV3 is JcoinTestV2 {
    /**
     * @dev Initialize the new version of the contract.
     * This function sets a new value in the TEST_SLOT storage slot.
     * The reinitializer modifier ensures it can only be called once per version.
     */
    function initialize() public virtual override reinitializer(3) {
        StorageSlot.getStringSlot(TEST_SLOT).value = "test_v3";
    }
}
