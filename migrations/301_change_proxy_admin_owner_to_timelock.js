const ProxyAdmin = artifacts.require("ProxyAdmin");
const Proxy = artifacts.require("TransparentUpgradeableProxy");
const Timelock = artifacts.require("Timelock");
const Implementation = artifacts.require("Jcoin");



module.exports = async function (deployer) {
  // Use environment variable or replace with actual TransparentUpgradeableProxy address.
  const proxyAddress = process.env.PROXY_ADDRESS;
  let proxy;
  if (!proxyAddress) {
    // Retrieve the deployed TransparentUpgradeableProxy instance if the address is not provided.
    proxy = await Proxy.deployed();
  } else {
    // Get the TransparentUpgradeableProxy instance at the provided address.
    proxy = await Proxy.at(proxyAddress);
  }


  // Use environment variable or replace with actual ProxyAdmin address.
  const proxyAdminAddress = process.env.PROXY_ADMIN_ADDRESS;
  let proxyAdmin;
  if (!proxyAdminAddress) {
    // Get the instance of the implementation contract at the TransparentUpgradeableProxy address.
    const instance = await Implementation.at(proxy.address);

    // Retrieve the proxy data, including admin address.
    const proxyData = await instance.proxy();

    // Get the ProxyAdmin instance using the admin address retrieved.
    proxyAdmin = await ProxyAdmin.at(proxyData.admin);
  } else {
    // Get the ProxyAdmin instance at the provided address.
    proxyAdmin = await ProxyAdmin.at(proxyAdminAddress);
  }


  // Ensure the ProxyAdmin address is provided.
  if (!proxyAdmin.address) {
    console.error("ProxyAdmin address not set. Please set the PROXY_ADMIN_ADDRESS or PROXY_ADDRESS environment variables.");
    process.exit(1);
  }


  // Get the deployed Timelock contract instance.
  const timelock = await Timelock.deployed();

  // Transfer ownership of the ProxyAdmin to the Timelock contract.
  await proxyAdmin.transferOwnership(timelock.address);
};
