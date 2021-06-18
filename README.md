# Oh! Finance - Contracts

Oh! Finance Ethereum Smart Contracts, written with Hardhat.


## Installation

1. Install dependencies with Yarn

```
yarn install
```

2. Set environment variables. Create a `.env` file at the project root and paste the contents of `.env.example`. Add required and desired optional variables.

- `MAINNET_NODE_URL`: **Required** - Mainnet archive node URL provided by Alchemy. Required for running tests that rely on locally forked mainnet.
- `RINKEBY_NODE_URL`: _Optional_ - Rinkeby archive node URL provided by Alchemy. Required for running any Rinkeby deployments.
- `KOVAN_NODE_URL`: _Optional_ - Kovan archive node URL provided by Alchemy. Required for running any Kovan deployments.
- `ETHERSCAN_API_KEY`: _Optional_ - Etherscan API Key used for verifying contracts. Required for running any live network deployment.
- `CMC_API_KEY`: _Optional_ - CoinMarketCap API Key used to output gas usage in USD using live ETH prices.
- `DEPLOYER_KEY`: _Optional_ - Mainnet Deployer Private Key. Required for live mainnet deployments.
- `TESTNET_DEPLOYER_KEY`: _Optional_ - Testnet Deployer Private Key. Required for live testnet deployments.

3. Compile contracts & build artifacts with Hardhat

```
yarn compile
```

4. Start the development server

```
yarn dev
```

## Usage

- Run tests with Mocha

```
# Run the entire test suite
yarn test

# Run the entire test suite and output gas usage report
yarn test:gas

# Run a single file of tests
yarn test test/OhToken.test.ts
```

- Build the docs site

```
# If you don't have serve installed
yarn global add serve

# Build and serve the site
yarn docs
```

- Execute a script

```
# Run a script on testnets
yarn rinkeby:run scripts/rinkeby_script.ts
yarn kovan:run scripts/kovan_script.ts

# Run a script on mainnet
yarn mainnet:run scripts/my_script.ts
```

- Deploy contracts

```
# Run entire deployment against localhost & testnets
yarn localhost:deploy
yarn rinkeby:deploy
yarn kovan:deploy

# Run entire mainnet deployment
yarn mainnet:deploy

# Run tagged mainnet deployments and any dependencies
yarn mainnet:deploy --tags OhTimelock
```


## References

- Hardhat: https://hardhat.org/getting-started/
- Hardhat Deploy: https://hardhat.org/plugins/hardhat-deploy.html
- AaveV2 Docs: https://docs.aave.com/developers
- Compound Docs: https://compound.finance/docs
- Curve Docs: https://resources.curve.fi/
- EIP-2612 Permit Signature: https://eips.ethereum.org/EIPS/eip-2612
- EIP-1967 Proxy Storage: https://eips.ethereum.org/EIPS/eip-1967
