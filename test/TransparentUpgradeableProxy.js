const ProxyAdmin = artifacts.require("ProxyAdmin");
const Proxy = artifacts.require("TransparentUpgradeableProxy");
const Timelock = artifacts.require("Timelock");
const Implementation = artifacts.require("Jcoin");
const NextImplementation = artifacts.require("JcoinTestV2"); // TODO: Jcoin next version



contract("TransparentUpgradeableProxy", (accounts) => {
  const [admin, other] = accounts;
  let proxyAdmin, proxy, instance, implementationV1;


  beforeEach(async () => {
    // Deploy the initial implementation and proxy
    implementationV1 = await Implementation.new();
    const initializeData = implementationV1.contract.methods.initialize().encodeABI();
    proxy = await Proxy.new(implementationV1.address, admin, initializeData);

    instance = await NextImplementation.at(proxy.address);
    const proxyData = await instance.proxy();
    proxyAdmin = await ProxyAdmin.at(proxyData.admin);
  });


  it("Should upgrade to new implementation", async () => {
    // Deploy the new implementation
    const nextImplementation = await NextImplementation.new();
    const initializeData = nextImplementation.contract.methods.initialize().encodeABI();

    // Upgrade the proxy to the new implementation
    await proxyAdmin.upgradeAndCall(
      proxy.address,
      nextImplementation.address,
      initializeData
    );

    // Assert: verify the implementation address is updated
    const proxyData = await instance.proxy();
    assert.equal(proxyData.implementation, nextImplementation.address);
  });


  it("Should revert if not admin", async () => {
    try {
      const nextImplementation = await NextImplementation.new();
      const initializeData = nextImplementation.contract.methods.initialize().encodeABI();

      // Upgrade the proxy to the new implementation
      await proxyAdmin.upgradeAndCall(
        proxy.address,
        nextImplementation.address,
        initializeData,
        { from: other }
      );
    } catch (error) {
      // 118cdaa7 - OwnableUnauthorizedAccount error.
      return assert.ok(
        error.data.result.includes("0x118cdaa7"),
        "Error code mismatch"
      );
    }
    return assert.fail("Expected an error but did not get one");
  });


  it("Should preserve data after upgrade", async () => {
    // Deploy the new implementation
    const nextImplementation = await NextImplementation.new();
    const initializeData = nextImplementation.contract.methods.initialize().encodeABI();

    // Upgrade the proxy to the new implementation
    await proxyAdmin.upgradeAndCall(
      proxy.address,
      nextImplementation.address,
      initializeData
    );

    assert.equal(await instance.test(), "test_v2");
  });
});
