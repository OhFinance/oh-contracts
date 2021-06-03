import {expect} from 'chai';
import {BankFixture, setupBankTest} from 'fixture';

describe('OhProxyAdmin', () => {
  let fixture: BankFixture;

  before(async () => {
    fixture = await setupBankTest();
  });

  it('is deployed correctly', async () => {
    const {deployer} = fixture;
    const {proxyAdmin, registry} = deployer;

    const registryAddress = await proxyAdmin.registry();
    const owner = await proxyAdmin.owner();

    expect(registryAddress).eq(registry.address);
    expect(owner).eq(deployer.address);
  });

  it('proxyAdmin is set correctly for all contracts', async () => {
    const {deployer} = fixture;
    const {proxyAdmin, usdcBankProxy, usdcAaveV2StrategyProxy, usdcCompStrategyProxy, usdcCrv3PoolStrategyProxy} = deployer;

    const bankAdmin = await proxyAdmin.getProxyAdmin(usdcBankProxy.address);
    const aaveV2Admin = await proxyAdmin.getProxyAdmin(usdcAaveV2StrategyProxy.address);
    const compoundAdmin = await proxyAdmin.getProxyAdmin(usdcCompStrategyProxy.address);
    const curve3PoolAdmin = await proxyAdmin.getProxyAdmin(usdcCrv3PoolStrategyProxy.address);

    expect(bankAdmin).eq(proxyAdmin.address);
    expect(aaveV2Admin).eq(proxyAdmin.address);
    expect(compoundAdmin).eq(proxyAdmin.address);
    expect(curve3PoolAdmin).eq(proxyAdmin.address);
  });

  it('proxyAdmin implementations are set correctly for all contracts', async () => {
    const {deployer} = fixture;
    const {
      proxyAdmin,
      bank,
      aaveV2Strategy,
      compStrategy,
      crv3PoolStrategy,
      usdcBankProxy,
      usdcAaveV2StrategyProxy,
      usdcCompStrategyProxy,
      usdcCrv3PoolStrategyProxy,
    } = deployer;

    const bankImplementation = await proxyAdmin.getProxyImplementation(usdcBankProxy.address);
    const aaveV2Implementation = await proxyAdmin.getProxyImplementation(usdcAaveV2StrategyProxy.address);
    const compoundImplementation = await proxyAdmin.getProxyImplementation(usdcCompStrategyProxy.address);
    const curve3PoolImplementation = await proxyAdmin.getProxyImplementation(usdcCrv3PoolStrategyProxy.address);

    expect(bankImplementation).eq(bank.address);
    expect(aaveV2Implementation).eq(aaveV2Strategy.address);
    expect(compoundImplementation).eq(compStrategy.address);
    expect(curve3PoolImplementation).eq(crv3PoolStrategy.address);
  });
});
