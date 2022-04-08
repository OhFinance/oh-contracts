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
  spdxLicenseIdentifier: {
    overwrite: false,
    runOnCompile: true,
  },
  mocha: {
    timeout: 12000000,
  },
  etherscan: {
    apiKey: {
      avalanche: process.env.SNOWTRACE_API_KEY || '',
      moonriver: process.env.MOONRIVER_MOONSCAN_API_KEY || '',
    }
  },
  abiExporter: {
    flat: true,
    clear: true,
  },
  docgen: {
    path: './docs',
  },
  typechain: {
    outDir: './types',
  },
  gasReporter: {
    currency: 'usd',
    enabled: !!process.env.REPORT_GAS,
    coinmarketcap: process.env.CMC_API_KEY || '',
  },
  namedAccounts: {
    deployer: 0,
    worker: 1,
    treasury: 2,
    foundation: '0xc8a5DF8c703139a0e4DFfd0bC21f67f20DD49Ae9',
    community: '0x3F62aC1a5d25f7c1F94C293D6421A91badF74681',
    strategic: '0x34e5b09E4da536e9e90af96fCb178C78c2671460',
    aave: {
      // AAVE ERC-20
      1: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
      42: '0xB597cd8D3217ea6477232F9217fa70837ff667Af',
      43113: '0x47183584aCbc1C45608d7B61cce1C562Ee180E7e',
    },
    aaveLendingPool: {
      1: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
      42: '0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe',
      43113: '0x76cc67FF2CC77821A70ED14321111Ce381C2594D',
      43114: '0x4F01AeD16D97E3aB5ab2B501154DC9bb0F1A5A2C',
    },
    aaveIncentivesController: {
      1: '0xd784927Ff2f95ba542BfC824c8a8a98F3495f6b5',
      43113: '0xa1EF206fb9a8D8186157FC817fCddcC47727ED55',
      43114: '0x01D83Fe6A10D2f2B7AF17034343746188272cAc9',
    },
    aaveStakedToken: '0x4da27a545c0c5B758a6BA100e3a049001de870f5', // stkAAVE
    aaveDaiToken: {
      1: '0x028171bca77440897b824ca71d1c56cac55b68a3',
      42: '0xfc54861772473cf00df8be1f5f7301bdf82020cd', // Kovan
    },
    aaveUsdcToken: {
      // AaveV2 aUSDC
      1: '0xBcca60bB61934080951369a648Fb03DF4F96263C',
      42: '0xe12AFeC5aa12Cf614678f9bFeeB98cA9Bb95b5B0',
    },
    aaveUsdtToken: {
      // AaveV2 aUSDT
      1: '0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811',
      42: '',
    },
    comp: {
      // COMP ERC-20
      1: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
      4: '0x0000000000000000000000000000000000000000',
      42: '0x61460874a7196d6a22D1eE4922473664b3E95270',
    },
    compComptroller: {
      // Compound Comptroller (Block-Based Rewards)
      1: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B',
      4: '0x2eaa9d77ae4d8f9cdd9faacd44016e746485bddb',
      42: '0x5eAe89DC1C671724A672ff0630122ee834098657',
    },
    compDaiToken: {
      // Compound cDAI
      1: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
      4: '0x6d7f0754ffeb405d23c51ce938289d4835be3b14',
      42: '0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad',
    },
    compUsdcToken: {
      // Compound cUSDC
      1: '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
      4: '0x5b281a6dda0b271e91ae35de655ad301c976edb1',
      42: '0x4a92e71227d294f041bd82dd8f78591b75140d63',
    },
    compUsdtToken: {
      // Compound cUSDT
      1: '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9',
      42: '0x3f0a0ea2f86bae6362cf9799b523ba06647da018',
    },
    crv: '0xD533a949740bb3306d119CC777fa900bA034cd52', // underlying CRV
    crv3Gauge: '0xbFcF63294aD7105dEa65aA58F8AE5BE2D9d0952A', // 3CRV Staking Pool
    crv3Pool: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7', // LP Pool
    crv3Token: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490', // 3CRV
    crvMintr: '0xd061D61a4d941c39E5453435B6345Dc261C2fcE0', // reward contract
    dai: {
      1: '0x6b175474e89094c44da98b954eedeac495271d0f',
      // Compound DAI Faucet Token
      4: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
      42: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
    },
    usdc: {
      1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      // Compound USDC Faucet Token
      4: '0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b',
      42: '0xb7a4F3E9097C08dA09517b5aB877F7a917224ede',
      // 42: '0xe22da380ee6B445bb8273C81944ADEB6E8450422' // USDC AAVE
    },
    usdt: {
      1: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      42: '0xf3e0d7bf58c5d455d31ef1c2d5375904df525105',
    },
    sushiswapV2: {
      // Sushiswap Router V2
      1: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
      4: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
      42: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
      43113: '',
      43114: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4', // trader joe
    },
    uniswapV2: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', /// uni router
    wavax: {
      43113: '0xd00ae08403B9bbb9124bB305C09058E32C39A48c',
      43114: '',
    },
    weth: {
      1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      4: '0xc778417e063141139fce010982780140aa0cd5ab',
      42: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
      43113: '0x9668f5f55f2712Dd2dfa316256609b516292D554',
    },
    zero: '0x0000000000000000000000000000000000000000',
  },
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
    hardhat: {
      live: false,
      chainId: 1,
      forking: {
        // enabled: false,
        blockNumber: 13489900,
        url: process.env.MAINNET_NODE_URL || '',
      },
    },
    rinkeby: {
      url: process.env.RINKEBY_NODE_URL || '',
      chainId: 4,
      accounts: process.env.TESTNET_DEPLOYER_KEY ? [`0x${process.env.TESTNET_DEPLOYER_KEY}`] : [],
    },
    kovan: {
      url: process.env.KOVAN_NODE_URL || '',
      chainId: 42,
      accounts: process.env.TESTNET_DEPLOYER_KEY ? [`0x${process.env.TESTNET_DEPLOYER_KEY}`] : [],
    },
    moonriver: {
      chainId: 1285,
      url: 'https://rpc.moonriver.moonbeam.network',
    },
    avalanche: {
      chainId: 43114,
      url: 'https://api.avax.network/ext/bc/C/rpc',
    },
    mainnet: {
      url: process.env.MAINNET_NODE_URL || '',
      chainId: 1,
      accounts:
        process.env.DEPLOYER_KEY && process.env.WORKER_KEY
          ? [`0x${process.env.DEPLOYER_KEY}`, `0x${process.env.WORKER_KEY}`]
          : [],
      gasPrice: 200000000000,
    },
  },
};

export default config;
