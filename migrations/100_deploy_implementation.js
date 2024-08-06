const Implementation = artifacts.require("Jcoin");



module.exports = async function (deployer) {
  // Deploy the Jcoin implementation contract.
  await deployer.deploy(Implementation);
};
