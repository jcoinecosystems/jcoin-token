# Deployment instructions


## Install dependencies
```bash
yarn install
```


## Compile, test, deploy and verify Smart Contracts
> Compiler options are defined in the file [/truffle-config.js](/truffle-config.js).


### Compile Smart Contracts
> After successful compilation, smart contract appear in [/flatten](/flatten) folder,
which already include all dependencies in one file.
```bash
yarn compile
```


### Test Smart Contracts
In a different terminal:
```bash
yarn ganache
```

```bash
yarn test
```


### Deploy Smart Contracts
Make `/.env` file from `/.env.example`.
Fill in the environment variable data:
  - MNEMONIC - Seed phrase (24 words) for the deployer wallet.
  - ENDPOINT_SEPOLIA - See [infura.io/](https://infura.io/) or [alchemy.com](https://alchemy.com/) or any public endpoin.
  - ENDPOINT_ETHEREUM - See [infura.io/](https://infura.io/) or [alchemy.com](https://alchemy.com/) or any public endpoin.
  - API_ETHERSCAN - [etherscan.io/myapikey](https://etherscan.io/myapikey).
  - PROXY_ADMIN_ADDRESS - `ProxyAdmin` address. If you need to upgrade Jcoin implementation.
  - PROXY_ADDRESS - `TransparentUpgradeableProxy` address. If you need to upgrade Jcoin implementation.

#### Deploy ProxyAdmin, Jcoin, TransparentUpgradeableProxy
```bash
yarn deploy sepolia --f 1 --to 102
```

#### Upgrade Jcoin without Timelock
Fix `PROXY_ADMIN_ADDRESS` and `PROXY_ADDRESS` in `/.env` file.
```bash
yarn deploy sepolia --f 200 --to 201
```

#### Deploy Timelock
Fix `proposers` and `executors` in `/migrations/300_deploy_timelock.js` file.
```bash
yarn deploy sepolia --f 300 --to 301
```

#### Upgrade Jcoin with Timelock
Fix `PROXY_ADMIN_ADDRESS` and `PROXY_ADDRESS` in `/.env` file.
```bash
yarn deploy sepolia --f 400 --to 402
```


### Verify Smart Contracts
For constructor arguments, please use [abi.hashex.org](https://abi.hashex.org/).
```bash
yarn verify sepolia Jcoin
yarn verify sepolia ProxyAdmin@? --forceConstructorArgs string:?
yarn verify sepolia TransparentUpgradeableProxy --custom-proxy TransparentUpgradeableProxy --forceConstructorArgs string:?
yarn verify sepolia Timelock

yarn verify sepolia JcoinTestV2
yarn verify sepolia JcoinTestV3
```
