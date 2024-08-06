const Proxy = artifacts.require("TransparentUpgradeableProxy");
const Implementation = artifacts.require("Jcoin");



module.exports = async function (deployer, network, accounts) {
  const initialOwner = accounts[0];


  // Get the deployed Jcoin contract instance.
  const implementation = await Implementation.deployed();

  // Encode the initializer function call for the TransparentUpgradeableProxy contract.
  const initializeData = implementation.contract.methods.initialize().encodeABI();
  console.log("initializeData:", initializeData);


  // Deploy the TransparentUpgradeableProxy contract.
  await deployer.deploy(
    Proxy,
    implementation.address,
    initialOwner,
    initializeData
  );


  // Get the deployed TransparentUpgradeableProxy contract instance.
  const proxy = await Proxy.deployed();

  // Get the instance of the implementation contract at the TransparentUpgradeableProxy address.
  const instance = await Implementation.at(proxy.address);

  // Retrieve the proxy data, including admin address.
  const proxyData = await instance.proxy();
  console.log("ProxyAdmin deployed at:", proxyData.admin);


  // Prepare force constructor arguments string for TransparentUpgradeableProxy verification.
  const typesArray = ["address", "address", "bytes"];
  const parameters = [implementation.address, initialOwner, initializeData];
  const forceConstructorArgs = web3.eth.abi.encodeParameters(typesArray, parameters).replace("0x", "");
  console.log(`--forceConstructorArgs string:${forceConstructorArgs}`);
};
