// environment variables
import 'dotenv/config';

// import path resolution
import 'tsconfig-paths/register';

// hardhat config
import {HardhatUserConfig, task} from 'hardhat/config';

// hardhat
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@typechain/hardhat';
import 'hardhat-abi-exporter';
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
  typechain: {
    outDir: 'types',
    target: 'ethers-v5',
  },
  gasReporter: {
    currency: 'usd',
    enabled: !!process.env.REPORT_GAS,
    coinmarketcap: process.env.COINMARKETCAP_KEY || '',
  },
  // namedAccounts: {
  //   deployer: 0,
  //   manager: 1,
  //   uniswapRouter: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  //   sushiswapRouter: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
  //   weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  //   usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  //   aaveAddressProvider: '0x24a42fD28C976A61Df5D00D0599C34c4f90748c8',
  //   aaveAddressProviderV2: '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5',
  //   aaveDataProvider: '',
  //   aaveDataProviderV2: '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d',
  //   aaveUsdcToken: '0x9bA00D6856a4eDF4665BcA2C2309936572473B7E',
  //   compoundComptroller: '',
  //   compoundToken: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
  //   compoundUsdcToken: '',
  //   curve3Token: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
  //   curve3Pool: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
  //   curveGauge: '',
  //   curveLocker: '0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2',
  //   curveMintr: '',
  //   curveToken: '0xD533a949740bb3306d119CC777fa900bA034cd52',

  //   sushiswapMasterchef: '',
  // },
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
    hardhat: {
      // loggingEnabled: true,
      chainId: 1,
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
