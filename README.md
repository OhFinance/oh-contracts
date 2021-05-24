# Oh! Finance - Contracts

Oh! Finance Ethereum Smart Contracts, written with Hardhat.

## Installation

1. Install dependencies with Yarn

```
yarn install
```

2. Compile contracts & build artifacts with Hardhat

```
yarn compile
```

3. Run tests with Mocha

```
yarn test
```

## Usage

- Deploy the contracts

```
npx hardhat --network rinkeby deploy

yarn rinkeby:deploy
yarn mainnet:deploy
```

- Run a script

```
npx hardhat --network testnet run scripts/my_script.ts

yarn testnet:run scripts/my_script.ts
yarn mainnet:run scripts/my_script.ts
```

## References

- Hardhat: https://hardhat.org/getting-started/
- Hardhat Deploy: https://hardhat.org/plugins/hardhat-deploy.html
- AAVE Deployed Docs: https://docs.aave.com/developers/v/1.0/deployed-contracts/deployed-contract-instances
- AAVE V2 Deployed Docs: https://docs.aave.com/developers/deployed-contracts/deployed-contracts
- Compound Docs: https://compound.finance/docs
- Curve Docs: https://resources.curve.fi/
