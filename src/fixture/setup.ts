import {deployments} from 'hardhat';
import {
  getUsdcBankContracts,
  getUsdtBankContracts,
  getDaiBankContracts,
  getGovernanceContracts,
  getManagementContracts,
  getTestContracts,
  getVestingContracts,
} from './contracts';

export const setupTest = deployments.createFixture(async ({deployments, getNamedAccounts}) => {
  await deployments.fixture(['OhRegistry', 'OhToken']);
  const {deployer, worker} = await getNamedAccounts();

  return {
    deployer: await getTestContracts(deployer),
    worker: await getTestContracts(worker),
  };
});

export const setupVestingTest = deployments.createFixture(
  async ({deployments, getNamedAccounts}) => {
    await deployments.fixture(['OhTimelock']);
    const {deployer, worker} = await getNamedAccounts();

    return {
      deployer: await getVestingContracts(deployer),
      worker: await getVestingContracts(worker),
    };
  }
);

export const setupManagementTest = deployments.createFixture(
  async ({deployments, getNamedAccounts}) => {
    await deployments.fixture(['OhManager', 'OhLiquidator', 'OhProxyAdmin']);
    const {deployer, worker} = await getNamedAccounts();

    return {
      deployer: await getManagementContracts(deployer),
      worker: await getManagementContracts(worker),
    };
  }
);

export const setupBankTest = deployments.createFixture(async ({deployments, getNamedAccounts}) => {
  await deployments.fixture([
    // 'OhForum',
    // 'OhGovernor',
    'OhUsdcBank',
    'OhUsdcAaveV2Strategy',
    'OhUsdcCompoundStrategy',
    'OhUsdcCurve3PoolStrategy',
  ]);
  const {deployer, worker} = await getNamedAccounts();

  return {
    deployer: await getUsdcBankContracts(deployer),
    worker: await getUsdcBankContracts(worker),
  };
});

export const setupUsdcBankTest = deployments.createFixture(
  async ({deployments, getNamedAccounts}) => {
    await deployments.fixture([
      'OhUsdcBank',
      'OhUsdcAaveV2Strategy',
      'OhUsdcCompoundStrategy',
      'OhUsdcCurve3PoolStrategy',
    ]);
    const {deployer, worker} = await getNamedAccounts();

    const deployerContracts = await getUsdcBankContracts(deployer);
    const {manager, bank, aaveV2Strategy, compStrategy, crv3PoolStrategy} = deployerContracts;

    // add the bank to the manager to enable deposits
    await manager.setBank(bank.address, true);
    await manager.setStrategy(bank.address, aaveV2Strategy.address, true);
    await manager.setStrategy(bank.address, compStrategy.address, true);
    await manager.setStrategy(bank.address, crv3PoolStrategy.address, true);

    return {
      deployer: deployerContracts,
      worker: await getUsdcBankContracts(worker),
    };
  }
);

export const setupUsdtBankTest = deployments.createFixture(
  async ({deployments, getNamedAccounts}) => {
    await deployments.fixture([
      'OhUsdtBank',
      'OhUsdtAaveV2Strategy',
      'OhUsdtCompoundStrategy',
      'OhUsdtCurve3PoolStrategy',
    ]);
    const {deployer, worker} = await getNamedAccounts();

    const deployerContracts = await getUsdtBankContracts(deployer);
    const {manager, bank, aaveV2Strategy, compStrategy, crv3PoolStrategy} = deployerContracts;

    // add the bank to the manager to enable deposits
    await manager.setBank(bank.address, true);
    await manager.setStrategy(bank.address, aaveV2Strategy.address, true);
    await manager.setStrategy(bank.address, compStrategy.address, true);
    await manager.setStrategy(bank.address, crv3PoolStrategy.address, true);

    return {
      deployer: deployerContracts,
      worker: await getUsdtBankContracts(worker),
    };
  }
);

export const setupDaiBankTest = deployments.createFixture(
  async ({deployments, getNamedAccounts}) => {
    await deployments.fixture([
      'OhDaiBank',
      'OhDaiAaveV2Strategy',
      'OhDaiCompoundStrategy',
      'OhDaiCurve3PoolStrategy',
    ]);
    const {deployer, worker} = await getNamedAccounts();

    const deployerContracts = await getDaiBankContracts(deployer);
    const {manager, bank, aaveV2Strategy, compStrategy, crv3PoolStrategy} = deployerContracts;

    // add the bank to the manager to enable deposits
    await manager.setBank(bank.address, true);
    await manager.setStrategy(bank.address, aaveV2Strategy.address, true);
    await manager.setStrategy(bank.address, compStrategy.address, true);
    await manager.setStrategy(bank.address, crv3PoolStrategy.address, true);

    return {
      deployer: deployerContracts,
      worker: await getDaiBankContracts(worker),
    };
  }
);

export const setupGovernanceTest = deployments.createFixture(
  async ({deployments, getNamedAccounts}) => {
    await deployments.fixture([
      'OhUsdcBank',
      'OhUsdcAaveV2Strategy',
      'OhUsdcCompoundStrategy',
      'OhUsdcCurve3PoolStrategy',
      'OhForum',
      'OhGovernor',
    ]);
    const {deployer, worker} = await getNamedAccounts();

    return {
      deployer: await getGovernanceContracts(deployer),
      worker: await getGovernanceContracts(worker),
    };
  }
);

export const setupVotingTest = deployments.createFixture(
  async ({deployments, getNamedAccounts}) => {
    await deployments.fixture([
      'OhUsdcBank',
      'OhUsdcAaveV2Strategy',
      'OhUsdcCompoundStrategy',
      'OhUsdcCurve3PoolStrategy',
      'OhForum',
      'OhGovernor',
      'OhGovernance',
    ]);
    const {deployer, worker} = await getNamedAccounts();

    return {
      deployer: await getGovernanceContracts(deployer),
      worker: await getGovernanceContracts(worker),
    };
  }
);
