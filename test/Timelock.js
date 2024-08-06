const Timelock = artifacts.require("Timelock");
const ProxyAdmin = artifacts.require("ProxyAdmin");
const Proxy = artifacts.require("TransparentUpgradeableProxy");
const Implementation = artifacts.require("Jcoin");
const NextImplementation = artifacts.require("JcoinTestV2"); // TODO: Jcoin next version

const { zero32bytes } = require("../lib/zero32bytes");
const { pause } = require("../lib/pause");



contract("Timelock", (accounts) => {
  const minDelay = 2; // 2 seconds
  const admin = accounts[0]; // Use the first account as admin.
  const proposer = accounts[1]; // Use the second account as proposer.
  const executor = accounts[2]; // Use the third account as executor.

  let timelock;


  beforeEach(async () => {
    timelock = await Timelock.new(minDelay, [proposer], [executor], admin);
  });


  it("Should have the correct admin", async () => {
    const adminRole = await timelock.DEFAULT_ADMIN_ROLE();
    const isAdmin = await timelock.hasRole(adminRole, admin);
    assert.isTrue(isAdmin, "Admin role is not correctly assigned");
  });


  it("Should have the correct proposers", async () => {
    const proposerRole = await timelock.PROPOSER_ROLE();
    const isProposer = await timelock.hasRole(proposerRole, proposer);
    assert.isTrue(isProposer, "Proposer role is not correctly assigned");

    const cancellerRole = await timelock.CANCELLER_ROLE();
    const isCanceller = await timelock.hasRole(cancellerRole, proposer);
    assert.isTrue(isCanceller, "Canceller role is not correctly assigned");
  });


  it("Should have the correct executors", async () => {
    const executorRole = await timelock.EXECUTOR_ROLE();
    const isExecutor = await timelock.hasRole(executorRole, executor);
    assert.isTrue(isExecutor, "Executor role is not correctly assigned");
  });


  describe("Upgrade Proxy via Timelock", () => {
    it("Should be upgraded", async () => {
      const implementation = await Implementation.new();
      // Encode the initializer function call for the TransparentUpgradeableProxy contract.
      const initializeData = implementation.contract.methods.initialize().encodeABI();
      // Deploy the TransparentUpgradeableProxy contract.
      const proxy = await Proxy.new(
        implementation.address,
        admin,
        initializeData
      );

      // Get the instance of the implementation contract at the TransparentUpgradeableProxy address.
      const instance = await Implementation.at(proxy.address);

      // Retrieve the proxy data, including admin address.
      const proxyData = await instance.proxy();
      const proxyAdmin = await ProxyAdmin.at(proxyData.admin);

      // Transfer ownership of the ProxyAdmin to the Timelock contract.
      await proxyAdmin.transferOwnership(timelock.address);


      // Encode the initialize function call for the upgrade.
      const nextImplementation = await NextImplementation.new();
      const initializeDataNext = nextImplementation.contract.methods.initialize().encodeABI();


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
        [proxy.address, nextImplementation.address, initializeDataNext]
      );


      // Get the deployed Timelock contract instance.
      let minDelay = await timelock.getMinDelay();
      minDelay = minDelay.toNumber();


      await timelock.schedule(
        proxyAdmin.address, // target
        0, // value
        callData, // data
        zero32bytes, // predecessor
        zero32bytes, // salt
        minDelay, // delay
        {
          from: proposer,
        }
      );


      const delay = (minDelay + 1) * 1000;
      await pause(delay);
      // Fix time at Ganache
      await web3.eth.sendTransaction({ from: admin, to: admin, value: 0, });


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
    });
  });
});
