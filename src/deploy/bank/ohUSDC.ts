import {Signer} from 'ethers';
import {addresses, deployProxyContract} from 'utils';
import {
  getAaveV2StrategyAt,
  getBankAt,
  getCompoundStrategyAt,
  getCurve3PoolStrategyAt,
  getInitializeAaveV2StrategyData,
  getInitializeBankData,
  getInitializeCompoundStrategyData,
  getInitializeCurve3PoolStrategyData,
} from 'lib';

// deploy + init the ohUSDC Bank Proxy contract
export const deployOhUsdcBank = async (
  deployer: Signer,
  registry: string, // registry address
  proxyAdmin: string, // proxy admin
  bankLogic: string // bank logic
) => {
  // form the input data
  const data = getInitializeBankData(
    'Oh! Interest Bearing USDC',
    'ohUSDC',
    registry,
    addresses.usdc
  );

  const bankUpgradeableProxy = await deployProxyContract(
    deployer,
    bankLogic,
    proxyAdmin,
    data
  );
  const bankProxy = await getBankAt(bankUpgradeableProxy.address, deployer);

  return {
    bankUpgradeableProxy,
    bankProxy,
  };
};

// deploy + init the aave v2 usdc strategy proxy
export const deployOhUsdcAaveV2Strategy = async (
  deployer: Signer,
  registry: string, // registry contract
  proxyAdmin: string, // proxy admin
  bankProxy: string, // bank proxy address
  aaveV2StrategyLogic: string // logic contract
) => {
  const data = getInitializeAaveV2StrategyData(
    registry,
    bankProxy,
    addresses.usdc,
    addresses.aaveUsdcToken
  );
  const aaveV2StrategyUpgradeableProxy = await deployProxyContract(
    deployer,
    aaveV2StrategyLogic,
    proxyAdmin,
    data
  );
  const aaveV2StrategyProxy = await getAaveV2StrategyAt(
    aaveV2StrategyUpgradeableProxy.address,
    deployer
  );

  return {
    aaveV2StrategyUpgradeableProxy,
    aaveV2StrategyProxy,
  };
};

// deploy + init the ohUSDC compound strategy proxy
export const deployOhUsdcCompoundStrategy = async (
  deployer: Signer,
  registry: string, // registry contract
  proxyAdmin: string, // proxy admin
  bankProxy: string, // bank proxy address
  compoundStrategyLogic: string // logic contract
) => {
  const data = getInitializeCompoundStrategyData(
    registry,
    bankProxy,
    addresses.usdc,
    addresses.compUsdcToken
  );
  const compoundStrategyUpgradeableProxy = await deployProxyContract(
    deployer,
    compoundStrategyLogic,
    proxyAdmin,
    data
  );
  const compoundStrategyProxy = await getCompoundStrategyAt(
    compoundStrategyUpgradeableProxy.address,
    deployer
  );

  return {
    compoundStrategyUpgradeableProxy,
    compoundStrategyProxy,
  };
};

// deploy + init the ohUSDC Curve 3Pool strategy
export const deployOhUsdcCurve3PoolStrategy = async (
  deployer: Signer,
  registry: string, // registry contract
  proxyAdmin: string, // proxy admin
  bankProxy: string, // bank proxy address
  curve3PoolStrategyLogic: string // logic contract
) => {
  const data = getInitializeCurve3PoolStrategyData(
    registry,
    bankProxy,
    addresses.usdc,
    '1'
  );
  const curve3PoolStrategyUpgradeableProxy = await deployProxyContract(
    deployer,
    curve3PoolStrategyLogic,
    proxyAdmin,
    data
  );
  const curve3PoolStrategyProxy = await getCurve3PoolStrategyAt(
    curve3PoolStrategyUpgradeableProxy.address,
    deployer
  );

  return {
    curve3PoolStrategyUpgradeableProxy,
    curve3PoolStrategyProxy,
  };
};

export const deploy = async (
  deployer: Signer,
  registry: string,
  proxyAdmin: string,
  bankLogic: string,
  aaveV2StrategyLogic: string,
  compoundStrategyLogic: string,
  curve3PoolStrategyLogic: string
) => {
  const {bankUpgradeableProxy, bankProxy} = await deployOhUsdcBank(
    deployer,
    registry,
    proxyAdmin,
    bankLogic
  );

  const {
    aaveV2StrategyUpgradeableProxy,
    aaveV2StrategyProxy,
  } = await deployOhUsdcAaveV2Strategy(
    deployer,
    registry,
    proxyAdmin,
    bankProxy.address,
    aaveV2StrategyLogic
  );

  const {
    compoundStrategyUpgradeableProxy,
    compoundStrategyProxy,
  } = await deployOhUsdcCompoundStrategy(
    deployer,
    registry,
    proxyAdmin,
    bankProxy.address,
    compoundStrategyLogic
  );

  const {
    curve3PoolStrategyUpgradeableProxy,
    curve3PoolStrategyProxy,
  } = await deployOhUsdcCurve3PoolStrategy(
    deployer,
    registry,
    proxyAdmin,
    bankProxy.address,
    curve3PoolStrategyLogic
  );

  return {
    bankUpgradeableProxy,
    bankProxy,
    aaveV2StrategyUpgradeableProxy,
    aaveV2StrategyProxy,
    compoundStrategyUpgradeableProxy,
    compoundStrategyProxy,
    curve3PoolStrategyUpgradeableProxy,
    curve3PoolStrategyProxy,
  };
};
