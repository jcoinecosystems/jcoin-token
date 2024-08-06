// SPDX-License-Identifier: GPL-3.0-or-later
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity 0.8.20;

import "../Jcoin.sol";

/**
 * @title JcoinTestV2
 * @dev This is an upgraded version of the Jcoin contract for testing purposes.
 * It adds a new storage slot for testing and initializes it with a specific value.
 */
contract JcoinTestV2 is Jcoin {
    /**
     * @dev Storage slot to store the test string.
     * This is the keccak-256 hash of "jcoin.storage.test" subtracted by 1.
     * bytes32(abi.encode(uint256(keccak256("jcoin.storage.test")) - 1))
     */
    bytes32 internal constant TEST_SLOT =
        0xbc62b1b652a62a505061773e99937257a488ff8d2545f6f751962bd87991e478;

    /**
     * @dev Initialize the new version of the contract.
     * This function sets a new value in the TEST_SLOT storage slot.
     * The reinitializer modifier ensures it can only be called once per version.
     */
    function initialize() public virtual override reinitializer(2) {
        StorageSlot.getStringSlot(TEST_SLOT).value = "test_v2";
    }

    /**
     * @dev Returns the version of the token contract.
     * This can be useful for identifying the deployed version of the contract, especially after upgrades.
     * @return The version string of the contract.
     */
    function version() external view virtual override returns (string memory) {
        return "2";
    }

    /**
     * @dev Returns the value stored in the TEST_SLOT storage slot.
     * This is used to verify that the upgraded contract has been initialized correctly.
     * @return The value stored in TEST_SLOT.
     */
    function test() public view returns (string memory) {
        return StorageSlot.getStringSlot(TEST_SLOT).value;
    }
}
