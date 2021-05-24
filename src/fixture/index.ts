import {bank, core, governance, logic} from 'deploy';
import {Signer} from 'ethers';
import {addBank, addStrategy} from 'lib';
import {getAccounts} from 'utils';
import {
  BankFixture,
  CoreFixture,
  GovernanceFixture,
  LogicFixture,
  OhUsdcFixture,
} from './types';

export * from './types';

export const coreFixture = async (): Promise<CoreFixture> => {
  const {deployer, worker} = await getAccounts();
  const {registry, token} = await core.deploy(deployer);
  return {
    deployer,
    worker,
    registry,
    token,
  };
};

export const governanceFixture = async (): Promise<GovernanceFixture> => {
  const fixture = await coreFixture();
  const {forum, manager, governor, proxyAdmin} = await governance.deploy(
    fixture.deployer,
    fixture.registry.address,
    fixture.token.address
  );

  return {
    ...fixture,
    forum,
    manager,
    governor,
    proxyAdmin,
  };
};

export const logicFixture = async (): Promise<LogicFixture> => {
  const fixture = await governanceFixture();
  const {
    bankLogic,
    aaveV2StrategyLogic,
    compoundStrategyLogic,
    curve3PoolStrategyLogic,
  } = await logic.deploy(fixture.deployer, fixture.registry.address);
  return {
    ...fixture,
    bankLogic,
    aaveV2StrategyLogic,
    compoundStrategyLogic,
    curve3PoolStrategyLogic,
  };
};

export const bankFixture = async (): Promise<BankFixture> => {
  const fixture = await logicFixture();
  const {
    bankProxy,
    bankUpgradeableProxy,
    aaveV2StrategyProxy,
    aaveV2StrategyUpgradeableProxy,
    compoundStrategyProxy,
    compoundStrategyUpgradeableProxy,
    curve3PoolStrategyProxy,
    curve3PoolStrategyUpgradeableProxy,
  } = await bank.ohUSDC.deploy(
    fixture.deployer,
    fixture.registry.address,
    fixture.proxyAdmin.address,
    fixture.bankLogic.address,
    fixture.aaveV2StrategyLogic.address,
    fixture.compoundStrategyLogic.address,
    fixture.curve3PoolStrategyLogic.address
  );

  return {
    ...fixture,
    bankProxy,
    bankUpgradeableProxy,
    aaveV2StrategyProxy,
    aaveV2StrategyUpgradeableProxy,
    compoundStrategyProxy,
    compoundStrategyUpgradeableProxy,
    curve3PoolStrategyProxy,
    curve3PoolStrategyUpgradeableProxy,
  };
};

export const ohUsdcFixture = async (): Promise<OhUsdcFixture> => {
  const fixture = await bankFixture();
  const {
    deployer,
    manager,
    bankProxy,
    aaveV2StrategyProxy,
    compoundStrategyProxy,
    curve3PoolStrategyProxy,
  } = fixture;

  await addBank(deployer, manager.address, bankProxy.address);
  await addStrategy(
    deployer,
    manager.address,
    bankProxy.address,
    aaveV2StrategyProxy.address
  );
  await addStrategy(
    deployer,
    manager.address,
    bankProxy.address,
    compoundStrategyProxy.address
  );
  await addStrategy(
    deployer,
    manager.address,
    bankProxy.address,
    curve3PoolStrategyProxy.address
  );

  return {
    ...fixture,
  };
};