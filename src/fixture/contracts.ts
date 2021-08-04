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

export const getUsdcBankContracts = async (signer: string) => {
  const contracts = await getGovernanceContracts(signer);
  const bankLogic = (await ethers.getContract('OhBank', signer)) as OhBank;
  const aaveV2StrategyLogic = (await ethers.getContract('OhAaveV2Strategy', signer)) as OhAaveV2Strategy;
  const compStrategyLogic = (await ethers.getContract('OhCompoundStrategy', signer)) as OhCompoundStrategy;
  const crv3PoolStrategyLogic = (await ethers.getContract('OhCurve3PoolStrategy', signer)) as OhCurve3PoolStrategy;

  const bankProxy = (await ethers.getContract('OhUsdcBank', signer)) as OhUpgradeableProxy;
  const aaveV2StrategyProxy = (await ethers.getContract('OhUsdcAaveV2Strategy', signer)) as OhUpgradeableProxy;
  const compStrategyProxy = (await ethers.getContract('OhUsdcCompoundStrategy', signer)) as OhUpgradeableProxy;
  const crv3PoolStrategyProxy = (await ethers.getContract('OhUsdcCurve3PoolStrategy', signer)) as OhUpgradeableProxy;

  const bank = (await ethers.getContractAt('OhBank', bankProxy.address, signer)) as OhBank;
  const aaveV2Strategy = (await ethers.getContractAt('OhAaveV2Strategy', aaveV2StrategyProxy.address, signer)) as OhAaveV2Strategy;
  const compStrategy = (await ethers.getContractAt('OhCompoundStrategy', compStrategyProxy.address, signer)) as OhCompoundStrategy;
  const crv3PoolStrategy = (await ethers.getContractAt(
    'OhCurve3PoolStrategy',
    crv3PoolStrategyProxy.address,
    signer
  )) as OhCurve3PoolStrategy;

  return {
    ...contracts,
    bankLogic,
    aaveV2StrategyLogic,
    compStrategyLogic,
    crv3PoolStrategyLogic,
    bankProxy,
    aaveV2StrategyProxy,
    compStrategyProxy,
    crv3PoolStrategyProxy,
    bank,
    aaveV2Strategy,
    compStrategy,
    crv3PoolStrategy,
  };
};

export const getUsdtBankContracts = async (signer: string) => {
  const contracts = await getGovernanceContracts(signer);
  const bankLogic = (await ethers.getContract('OhBank', signer)) as OhBank;
  const aaveV2StrategyLogic = (await ethers.getContract('OhAaveV2Strategy', signer)) as OhAaveV2Strategy;
  const compStrategyLogic = (await ethers.getContract('OhCompoundStrategy', signer)) as OhCompoundStrategy;
  const crv3PoolStrategyLogic = (await ethers.getContract('OhCurve3PoolStrategy', signer)) as OhCurve3PoolStrategy;

  const bankProxy = (await ethers.getContract('OhUsdtBank', signer)) as OhUpgradeableProxy;
  const aaveV2StrategyProxy = (await ethers.getContract('OhUsdtAaveV2Strategy', signer)) as OhUpgradeableProxy;
  const compStrategyProxy = (await ethers.getContract('OhUsdtCompoundStrategy', signer)) as OhUpgradeableProxy;
  const crv3PoolStrategyProxy = (await ethers.getContract('OhUsdtCurve3PoolStrategy', signer)) as OhUpgradeableProxy;

  const bank = (await ethers.getContractAt('OhBank', bankProxy.address, signer)) as OhBank;
  const aaveV2Strategy = (await ethers.getContractAt('OhAaveV2Strategy', aaveV2StrategyProxy.address, signer)) as OhAaveV2Strategy;
  const compStrategy = (await ethers.getContractAt('OhCompoundStrategy', compStrategyProxy.address, signer)) as OhCompoundStrategy;
  const crv3PoolStrategy = (await ethers.getContractAt(
    'OhCurve3PoolStrategy',
    crv3PoolStrategyProxy.address,
    signer
  )) as OhCurve3PoolStrategy;

  return {
    ...contracts,
    bankLogic,
    aaveV2StrategyLogic,
    compStrategyLogic,
    crv3PoolStrategyLogic,
    bankProxy,
    aaveV2StrategyProxy,
    compStrategyProxy,
    crv3PoolStrategyProxy,
    bank,
    aaveV2Strategy,
    compStrategy,
    crv3PoolStrategy,
  };
};

export const getDaiBankContracts = async (signer: string) => {
  const contracts = await getGovernanceContracts(signer);
  const bankLogic = (await ethers.getContract('OhBank', signer)) as OhBank;
  const aaveV2StrategyLogic = (await ethers.getContract('OhAaveV2Strategy', signer)) as OhAaveV2Strategy;
  const compStrategyLogic = (await ethers.getContract('OhCompoundStrategy', signer)) as OhCompoundStrategy;
  const crv3PoolStrategyLogic = (await ethers.getContract('OhCurve3PoolStrategy', signer)) as OhCurve3PoolStrategy;

  const bankProxy = (await ethers.getContract('OhDaiBank', signer)) as OhUpgradeableProxy;
  const aaveV2StrategyProxy = (await ethers.getContract('OhDaiAaveV2Strategy', signer)) as OhUpgradeableProxy;
  const compStrategyProxy = (await ethers.getContract('OhDaiCompoundStrategy', signer)) as OhUpgradeableProxy;
  const crv3PoolStrategyProxy = (await ethers.getContract('OhDaiCurve3PoolStrategy', signer)) as OhUpgradeableProxy;

  const bank = (await ethers.getContractAt('OhBank', bankProxy.address, signer)) as OhBank;
  const aaveV2Strategy = (await ethers.getContractAt('OhAaveV2Strategy', aaveV2StrategyProxy.address, signer)) as OhAaveV2Strategy;
  const compStrategy = (await ethers.getContractAt('OhCompoundStrategy', compStrategyProxy.address, signer)) as OhCompoundStrategy;
  const crv3PoolStrategy = (await ethers.getContractAt(
    'OhCurve3PoolStrategy',
    crv3PoolStrategyProxy.address,
    signer
  )) as OhCurve3PoolStrategy;

  return {
    ...contracts,
    bankLogic,
    aaveV2StrategyLogic,
    compStrategyLogic,
    crv3PoolStrategyLogic,
    bankProxy,
    aaveV2StrategyProxy,
    compStrategyProxy,
    crv3PoolStrategyProxy,
    bank,
    aaveV2Strategy,
    compStrategy,
    crv3PoolStrategy,
  };
};
