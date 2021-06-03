import {deployments} from 'hardhat';
import {getBankContracts, getGovernanceContracts, getManagementContracts, getTestContracts, getVestingContracts} from './contracts';

export const setupTest = deployments.createFixture(async ({deployments, getNamedAccounts}) => {
  await deployments.fixture(['OhRegistry', 'OhToken']);
  const {deployer, worker} = await getNamedAccounts();

  return {
    deployer: await getTestContracts(deployer),
    worker: await getTestContracts(worker),
  };
});

export const setupVestingTest = deployments.createFixture(async ({deployments, getNamedAccounts}) => {
  await deployments.fixture(['OhTimelock']);
  const {deployer, worker} = await getNamedAccounts();

  return {
    deployer: await getVestingContracts(deployer),
    worker: await getVestingContracts(worker),
  };
});

export const setupManagementTest = deployments.createFixture(async ({deployments, getNamedAccounts}) => {
  await deployments.fixture(['OhManager', 'OhLiquidator', 'OhProxyAdmin']);
  const {deployer, worker} = await getNamedAccounts();

  return {
    deployer: await getManagementContracts(deployer),
    worker: await getManagementContracts(worker),
  };
});

export const setupGovernanceTest = deployments.createFixture(async ({deployments, getNamedAccounts}) => {
  await deployments.fixture(['OhManager', 'OhLiquidator', 'OhProxyAdmin', 'OhForum', 'OhGovernor']);
  const {deployer, worker} = await getNamedAccounts();

  return {
    deployer: await getGovernanceContracts(deployer),
    worker: await getGovernanceContracts(worker),
  };
});

export const setupBankTest = deployments.createFixture(async ({deployments, getNamedAccounts}) => {
  await deployments.fixture([
    'OhForum',
    'OhGovernor',
    'OhUsdcBank',
    'OhUsdcAaveV2Strategy',
    'OhUsdcCompoundStrategy',
    'OhUsdcCurve3PoolStrategy',
  ]);
  const {deployer, worker} = await getNamedAccounts();

  return {
    deployer: await getBankContracts(deployer),
    worker: await getBankContracts(worker),
  };
});

export const setupUsdcBankTest = deployments.createFixture(async ({deployments, getNamedAccounts}) => {
  await deployments.fixture([
    'OhForum',
    'OhGovernor',
    'OhUsdcBank',
    'OhUsdcAaveV2Strategy',
    'OhUsdcCompoundStrategy',
    'OhUsdcCurve3PoolStrategy',
  ]);
  const {deployer, worker} = await getNamedAccounts();

  const deployerContracts = await getBankContracts(deployer);
  const {manager, usdcBank, usdcAaveV2Strategy, usdcCompStrategy, usdcCrv3PoolStrategy} = deployerContracts;

  // add the bank to the manager to enable deposits
  await manager.setBank(usdcBank.address, true);
  await manager.addStrategy(usdcBank.address, usdcAaveV2Strategy.address);
  await manager.addStrategy(usdcBank.address, usdcCompStrategy.address);
  await manager.addStrategy(usdcBank.address, usdcCrv3PoolStrategy.address);

  return {
    deployer: deployerContracts,
    worker: await getBankContracts(worker),
  };
});
