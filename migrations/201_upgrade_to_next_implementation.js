const ProxyAdmin = artifacts.require("ProxyAdmin");
const Proxy = artifacts.require("TransparentUpgradeableProxy");
const Implementation = artifacts.require("Jcoin");
const NextImplementation = artifacts.require("JcoinTestV2"); // TODO: Jcoin next version



module.exports = async function (deployer, network) {
  if (network !== "development") process.exit(1);


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

  // Ensure the ProxyAdmin address and Proxy address are provided.
  if (!proxyAdmin.address || !proxy.address) {
    console.error("ProxyAdmin address or Proxy address not set. Please set the PROXY_ADMIN_ADDRESS and PROXY_ADDRESS environment variables.");
    process.exit(1);
  }


  // Encode the initialize function call for the upgrade.
  const nextImplementation = await NextImplementation.deployed();
  const initializeData = nextImplementation.contract.methods.initialize().encodeABI();
  console.log("initializeData:", initializeData);


  // Perform the upgrade and call.
  await proxyAdmin.upgradeAndCall(
    proxy.address,
    nextImplementation.address,
    initializeData
  );
};
