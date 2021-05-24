import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {
  OhAaveV2Strategy,
  OhBank,
  OhCompoundStrategy,
  OhCurve3PoolStrategy,
  OhForum,
  OhGovernor,
  OhManager,
  OhProxyAdmin,
  OhRegistry,
  OhToken,
  OhUpgradeableProxy,
} from 'types';

export interface CoreFixture {
  deployer: SignerWithAddress;
  worker: SignerWithAddress;
  registry: OhRegistry;
  token: OhToken;
}

export interface GovernanceFixture extends CoreFixture {
  forum: OhForum;
  manager: OhManager;
  governor: OhGovernor;
  proxyAdmin: OhProxyAdmin;
}

export interface LogicFixture extends GovernanceFixture {
  bankLogic: OhBank;
  aaveV2StrategyLogic: OhAaveV2Strategy;
  compoundStrategyLogic: OhCompoundStrategy;
  curve3PoolStrategyLogic: OhCurve3PoolStrategy;
}

export interface BankFixture extends LogicFixture {
  bankProxy: OhBank;
  bankUpgradeableProxy: OhUpgradeableProxy;
  aaveV2StrategyProxy: OhAaveV2Strategy;
  aaveV2StrategyUpgradeableProxy: OhUpgradeableProxy;
  compoundStrategyProxy: OhCompoundStrategy;
  compoundStrategyUpgradeableProxy: OhUpgradeableProxy;
  curve3PoolStrategyProxy: OhCurve3PoolStrategy;
  curve3PoolStrategyUpgradeableProxy: OhUpgradeableProxy;
}

export interface OhUsdcFixture extends BankFixture {}
