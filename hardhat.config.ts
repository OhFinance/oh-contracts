// environment variables
import 'dotenv/config';

// import path resolution
import 'tsconfig-paths/register';

// hardhat config
import {HardhatUserConfig, task} from 'hardhat/config';

// hardhat
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-abi-exporter';
import 'hardhat-docgen';
import 'hardhat-gas-reporter';
import 'hardhat-spdx-license-identifier';

task('accounts', 'Prints the list of accounts', async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  solidity: {
    version: '0.7.6',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  spdxLicenseIdentifier: {
    overwrite: false,
    runOnCompile: true,
  },
  mocha: {
    timeout: 1200000,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY || '',
  },
  abiExporter: {
    flat: true,
    clear: true,
  },
  docgen: {
    path: './docs',
  },
  typechain: {
    outDir: 'types',
    target: 'ethers-v5',
  },
  gasReporter: {
    currency: 'usd',
    enabled: !!process.env.REPORT_GAS,
    coinmarketcap: process.env.COINMARKETCAP_KEY || '',
  },
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
    hardhat: {
      chainId: 1, //31337,
      forking: {
        // enabled: false,
        blockNumber: 12495621,
        url: process.env.ALCHEMY_MAIN_KEY || '',
      },
    },
    rinkeby: {
      url: process.env.ALCHEMY_RINKEBY_KEY || '',
      chainId: 4,
      accounts: process.env.DEPLOYER_RINKEBY_KEY
        ? [`0x${process.env.DEPLOYER_RINKEBY_KEY}`]
        : [],
    },
    mainnet: {
      url: process.env.ALCHEMY_MAIN_KEY || '',
      chainId: 1,
      accounts: process.env.DEPLOYER_MAIN_KEY
        ? [`0x${process.env.DEPLOYER_MAIN_KEY}`]
        : [],
    },
  },
};

export default config;
