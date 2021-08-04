import {expect} from 'chai';
import {BankFixture, setupUsdcBankTest} from 'fixture';

describe('OhProxyAdmin', () => {
  let fixture: BankFixture;

  before(async () => {
    fixture = await setupUsdcBankTest();
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
    const {proxyAdmin, bankProxy, aaveV2StrategyProxy, compStrategyProxy, crv3PoolStrategyProxy} = deployer;

    const bankAdmin = await proxyAdmin.getProxyAdmin(bankProxy.address);
    const aaveV2Admin = await proxyAdmin.getProxyAdmin(aaveV2StrategyProxy.address);
    const compoundAdmin = await proxyAdmin.getProxyAdmin(compStrategyProxy.address);
    const curve3PoolAdmin = await proxyAdmin.getProxyAdmin(crv3PoolStrategyProxy.address);

    expect(bankAdmin).eq(proxyAdmin.address);
    expect(aaveV2Admin).eq(proxyAdmin.address);
    expect(compoundAdmin).eq(proxyAdmin.address);
    expect(curve3PoolAdmin).eq(proxyAdmin.address);
  });

  it('proxyAdmin implementations are set correctly for all contracts', async () => {
    const {deployer} = fixture;
    const {
      proxyAdmin,
      bankLogic,
      aaveV2StrategyLogic,
      compStrategyLogic,
      crv3PoolStrategyLogic,
      bankProxy,
      aaveV2StrategyProxy,
      compStrategyProxy,
      crv3PoolStrategyProxy,
    } = deployer;

    const bankImplementation = await proxyAdmin.getProxyImplementation(bankProxy.address);
    const aaveV2Implementation = await proxyAdmin.getProxyImplementation(aaveV2StrategyProxy.address);
    const compoundImplementation = await proxyAdmin.getProxyImplementation(compStrategyProxy.address);
    const curve3PoolImplementation = await proxyAdmin.getProxyImplementation(crv3PoolStrategyProxy.address);

    expect(bankImplementation).eq(bankLogic.address);
    expect(aaveV2Implementation).eq(aaveV2StrategyLogic.address);
    expect(compoundImplementation).eq(compStrategyLogic.address);
    expect(curve3PoolImplementation).eq(crv3PoolStrategyLogic.address);
  });
});
