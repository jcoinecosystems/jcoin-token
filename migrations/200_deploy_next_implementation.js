const NextImplementation = artifacts.require("JcoinTestV2"); // TODO: Jcoin next version



module.exports = async function (deployer, network) {
  if (network !== "development") process.exit(1);


  // Deploy the next version of the Jcoin implementation contract.
  await deployer.deploy(NextImplementation);
};
