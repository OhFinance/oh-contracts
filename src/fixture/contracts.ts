import {ethers} from 'hardhat';
import {
  OhAaveV2Strategy,
  OhBank,
  OhCompoundStrategy,
  OhCurve3PoolStrategy,
  OhForum,
  OhGovernor,
  OhLiquidator,
  OhManager,
  OhProxyAdmin,
  OhRegistry,
  OhTimelock,
  OhToken,
  OhUpgradeableProxy,
} from 'types';

export const getTestContracts = async (signer: string) => {
  const registry = (await ethers.getContract('OhRegistry', signer)) as OhRegistry;
  const token = (await ethers.getContract('OhToken', signer)) as OhToken;

  return {
    address: signer,
    registry,
    token,
  };
};

export const getVestingContracts = async (signer: string) => {
  const contracts = await getTestContracts(signer);
  const vesting = (await ethers.getContract('OhVestingTimelock', signer)) as OhTimelock;
  const foundation = (await ethers.getContract('OhFoundationTimelock', signer)) as OhTimelock;
  const growth = (await ethers.getContract('OhGrowthTimelock', signer)) as OhTimelock;
  const legal = (await ethers.getContract('OhLegalTimelock', signer)) as OhTimelock;

  return {
    ...contracts,
    vesting,
    foundation,
    growth,
    legal,
  };
};

export const getManagementContracts = async (signer: string) => {
  const contracts = await getTestContracts(signer);
  const liquidator = (await ethers.getContract('OhLiquidator', signer)) as OhLiquidator;
  const manager = (await ethers.getContract('OhManager', signer)) as OhManager;
  const proxyAdmin = (await ethers.getContract('OhProxyAdmin', signer)) as OhProxyAdmin;

  return {
    ...contracts,
    liquidator,
    manager,
    proxyAdmin,
  };
};

export const getGovernanceContracts = async (signer: string) => {
  const contracts = await getManagementContracts(signer);
  const forum = (await ethers.getContract('OhForum', signer)) as OhForum;
  const governor = (await ethers.getContract('OhGovernor', signer)) as OhGovernor;

  return {
    ...contracts,
    forum,
    governor,
  };
};

export const getBankContracts = async (signer: string) => {
  const contracts = await getGovernanceContracts(signer);
  const bank = (await ethers.getContract('OhBank', signer)) as OhBank;
  const aaveV2Strategy = (await ethers.getContract('OhAaveV2Strategy', signer)) as OhAaveV2Strategy;
  const compStrategy = (await ethers.getContract('OhCompoundStrategy', signer)) as OhCompoundStrategy;
  const crv3PoolStrategy = (await ethers.getContract('OhCurve3PoolStrategy', signer)) as OhCurve3PoolStrategy;

  const usdcBankProxy = (await ethers.getContract('OhUsdcBank', signer)) as OhUpgradeableProxy;
  const usdcAaveV2StrategyProxy = (await ethers.getContract('OhUsdcAaveV2Strategy', signer)) as OhUpgradeableProxy;
  const usdcCompStrategyProxy = (await ethers.getContract('OhUsdcCompoundStrategy', signer)) as OhUpgradeableProxy;
  const usdcCrv3PoolStrategyProxy = (await ethers.getContract('OhUsdcCurve3PoolStrategy', signer)) as OhUpgradeableProxy;

  const usdcBank = (await ethers.getContractAt('OhBank', usdcBankProxy.address, signer)) as OhBank;
  const usdcAaveV2Strategy = (await ethers.getContractAt('OhAaveV2Strategy', usdcAaveV2StrategyProxy.address, signer)) as OhAaveV2Strategy;
  const usdcCompStrategy = (await ethers.getContractAt('OhCompoundStrategy', usdcCompStrategyProxy.address, signer)) as OhCompoundStrategy;
  const usdcCrv3PoolStrategy = (await ethers.getContractAt(
    'OhCurve3PoolStrategy',
    usdcCrv3PoolStrategyProxy.address,
    signer
  )) as OhCurve3PoolStrategy;

  return {
    ...contracts,
    bank,
    aaveV2Strategy,
    compStrategy,
    crv3PoolStrategy,
    usdcBankProxy,
    usdcAaveV2StrategyProxy,
    usdcCompStrategyProxy,
    usdcCrv3PoolStrategyProxy,
    usdcBank,
    usdcAaveV2Strategy,
    usdcCompStrategy,
    usdcCrv3PoolStrategy,
  };
};
