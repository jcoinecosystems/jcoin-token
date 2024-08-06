const Timelock = artifacts.require("Timelock");

const { zeroAddress } = require("../lib/zeroAddress");



module.exports = async function (deployer, network, accounts) {
  // Define the parameters for the Timelock contract.
  let minDelay = 2 * 24 * 60 * 60; // 2 days in seconds.
  let admin = zeroAddress; // Initial admin.
  let proposers = []; // Initial proposers. TODO: Multisig wallet address.
  let executors = []; // Initial executors. TODO: Multisig wallet address.

  if (network === "development") {
    // If in development network, set the minDelay to 2 seconds and use local accounts.
    minDelay = 2; // 2 seconds for faster testing.
    admin = accounts[0]; // Use the first account as admin.
    proposers = [accounts[1]]; // Use the second account as proposer.
    executors = [accounts[2]]; // Use the third account as executor.
  } else {
    // Check if the proposers or executors arrays are empty.
    if (proposers.length === 0 || executors.length === 0) {
      // If not in development network, throw an error and exit the process.
      console.error("Error: Proposers or Executors array is empty. Please provide the correct data.");
      process.exit(1);
    }
  }


  // Deploy the Timelock contract with the specified parameters.
  await deployer.deploy(Timelock, minDelay, proposers, executors, admin);
};
