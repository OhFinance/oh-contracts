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
import 'hardhat-deploy';
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
  paths: {
    deploy: './src/deploy',
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
  namedAccounts: {
    deployer: 0,
    worker: 1,
    treasury: 2,
    // community: 3,
    // strategic: 4
    aave: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', // AAVE
    aaveLendingPool: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
    aaveIncentivesController: '0xd784927Ff2f95ba542BfC824c8a8a98F3495f6b5',
    aaveStakedToken: '0x4da27a545c0c5B758a6BA100e3a049001de870f5', // stkAAVE
    aaveUsdcToken: '0xBcca60bB61934080951369a648Fb03DF4F96263C', // aUSDC V2
    comp: '0xc00e94Cb662C3520282E6f5717214004A7f26888', // COMP
    compComptroller: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B', // Comptroller
    compUsdcToken: '0x39AA39c021dfbaE8faC545936693aC917d5E7563', // cUSDC
    crv: '0xD533a949740bb3306d119CC777fa900bA034cd52', // underlying CRV
    crv3Gauge: '0xbFcF63294aD7105dEa65aA58F8AE5BE2D9d0952A', // 3CRV Staking Pool
    crv3Pool: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7', // LP Pool
    crv3Token: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490', // 3CRV
    crvMintr: '0xd061D61a4d941c39E5453435B6345Dc261C2fcE0', // reward contract
    usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    sushiswapV2: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F', // sushi router
    uniswapV2: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', /// uni router
    weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    zero: '0x0000000000000000000000000000000000000000',
  },
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
    hardhat: {
      live: false,
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
      accounts: process.env.DEPLOYER_RINKEBY_KEY ? [`0x${process.env.DEPLOYER_RINKEBY_KEY}`] : [],
    },
    mainnet: {
      url: process.env.ALCHEMY_MAIN_KEY || '',
      chainId: 1,
      accounts: process.env.DEPLOYER_MAIN_KEY ? [`0x${process.env.DEPLOYER_MAIN_KEY}`] : [],
    },
  },
};

export default config;
