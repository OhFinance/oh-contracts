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

export interface BaseAccount {
  address: string;
  registry: OhRegistry;
  token: OhToken;
}

export interface VestingAccount extends BaseAccount {
  vesting: OhTimelock;
  foundation: OhTimelock;
  growth: OhTimelock;
  legal: OhTimelock;
}

export interface ManagementAccount extends BaseAccount {
  manager: OhManager;
  liquidator: OhLiquidator;
  proxyAdmin: OhProxyAdmin;
}

export interface GovernanceAccount extends ManagementAccount {
  forum: OhForum;
  governor: OhGovernor;
}

export interface BankAccount extends GovernanceAccount {
  bankLogic: OhBank;
  aaveV2StrategyLogic: OhAaveV2Strategy;
  compStrategyLogic: OhCompoundStrategy;
  crv3PoolStrategyLogic: OhCurve3PoolStrategy;
  bankProxy: OhUpgradeableProxy;
  aaveV2StrategyProxy: OhUpgradeableProxy;
  compStrategyProxy: OhUpgradeableProxy;
  crv3PoolStrategyProxy: OhUpgradeableProxy;
  bank: OhBank;
  aaveV2Strategy: OhAaveV2Strategy;
  compStrategy: OhCompoundStrategy;
  crv3PoolStrategy: OhCurve3PoolStrategy;
}

export interface BaseFixture {
  deployer: BaseAccount;
  worker: BaseAccount;
}

export interface VestingFixture {
  deployer: VestingAccount;
  worker: VestingAccount;
}

export interface ManagementFixture {
  deployer: ManagementAccount;
  worker: ManagementAccount;
}

export interface GovernanceFixture {
  deployer: GovernanceAccount;
  worker: GovernanceAccount;
}

export interface BankFixture {
  deployer: BankAccount;
  worker: BankAccount;
}

// export interface CoreFixture {
//   deployer: SignerWithAddress;
//   worker: SignerWithAddress;
//   registry: OhRegistry;
//   token: OhToken;
// }

// export interface TimelockFixture extends CoreFixture {
//   timelock: OhTimelock;
//   foundation: OhTimelock;
//   funds: OhTimelock;
//   legal: OhTimelock;
// }

// export interface ManagerFixture extends CoreFixture {
//   manager: OhManager;
//   liquidator: OhLiquidator;
// }

// export interface GovernanceFixture extends ManagerFixture {
//   forum: OhForum;
//   manager: OhManager;
//   governor: OhGovernor;
//   proxyAdmin: OhProxyAdmin;
// }

// export interface LogicFixture extends GovernanceFixture {
//   bankLogic: OhBank;
//   aaveV2StrategyLogic: OhAaveV2Strategy;
//   compoundStrategyLogic: OhCompoundStrategy;
//   curve3PoolStrategyLogic: OhCurve3PoolStrategy;
// }

// export interface BankFixture extends LogicFixture {
//   bankProxy: OhBank;
//   bankUpgradeableProxy: OhUpgradeableProxy;
//   aaveV2StrategyProxy: OhAaveV2Strategy;
//   aaveV2StrategyUpgradeableProxy: OhUpgradeableProxy;
//   compoundStrategyProxy: OhCompoundStrategy;
//   compoundStrategyUpgradeableProxy: OhUpgradeableProxy;
//   curve3PoolStrategyProxy: OhCurve3PoolStrategy;
//   curve3PoolStrategyUpgradeableProxy: OhUpgradeableProxy;
// }

// export interface OhUsdcFixture extends BankFixture {}
