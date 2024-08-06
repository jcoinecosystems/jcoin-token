const Timelock = artifacts.require("Timelock");
const ProxyAdmin = artifacts.require("ProxyAdmin");
const Proxy = artifacts.require("TransparentUpgradeableProxy");
const Implementation = artifacts.require("Jcoin");
const NextImplementation = artifacts.require("JcoinTestV3"); // TODO: Jcoin next version

const { zero32bytes } = require("../lib/zero32bytes");
const { pause } = require("../lib/pause");



module.exports = async function (deployer, network, accounts) {
  if (network !== "development") process.exit(1);


  const executor = accounts[2];

  // Use environment variable or replace with actual proxy address.
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


  // Encode the initialize function call for the upgrade.
  const nextImplementation = await NextImplementation.deployed();
  const initializeData = nextImplementation.contract.methods.initialize().encodeABI();
  console.log("initializeData:", initializeData);


  // Define the call data for the upgradeAndCall function.
  const callData = web3.eth.abi.encodeFunctionCall(
    {
      name: "upgradeAndCall",
      type: "function",
      inputs: [
        { type: "address", name: "proxy" },
        { type: "address", name: "implementation" },
        { type: "bytes", name: "data" }
      ]
    },
    [proxy.address, nextImplementation.address, initializeData]
  );
  console.log("upgradeAndCallData:", callData);


  // Get the deployed Timelock contract instance.
  const timelock = await Timelock.deployed();
  let minDelay = await timelock.getMinDelay();
  minDelay = minDelay.toNumber();
  const delay = (minDelay + 1) * 1000;

  if (network === "development") {
    await pause(delay);
    // Fix time at Ganache
    await web3.eth.sendTransaction({ from: accounts[0], to: accounts[0], value: 0, });
  }


  // Execute the upgrade.
  const executeData = timelock.contract.methods.execute(
    proxyAdmin.address, 0, callData, zero32bytes, zero32bytes
  ).encodeABI();
  console.log("executeData:", executeData);

  await timelock.execute(
    proxyAdmin.address, // target
    0, // value
    callData, // payload
    zero32bytes, // predecessor
    zero32bytes, // salt
    {
      from: executor,
    }
  );
};
