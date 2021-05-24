import {expect} from 'chai';
import {ohUsdcFixture, OhUsdcFixture} from 'fixture';

describe('OhProxyAdmin', () => {
  let fixture: OhUsdcFixture;

  before(async () => {
    fixture = await ohUsdcFixture();
  });

  it('proxyAdmin is deployed correctly', async () => {
    const {proxyAdmin, registry} = fixture;
    const registryAddress = await proxyAdmin.registry();
    expect(registryAddress).eq(registry.address);
  });

  it('proxyAdmin is set correctly for all contracts', async () => {
    const {
      proxyAdmin,
      bankProxy,
      aaveV2StrategyProxy,
      compoundStrategyProxy,
      curve3PoolStrategyProxy,
    } = fixture;

    const bankAdmin = await proxyAdmin.getProxyAdmin(bankProxy.address);
    const aaveV2Admin = await proxyAdmin.getProxyAdmin(
      aaveV2StrategyProxy.address
    );
    const compoundAdmin = await proxyAdmin.getProxyAdmin(
      compoundStrategyProxy.address
    );
    const curve3PoolAdmin = await proxyAdmin.getProxyAdmin(
      curve3PoolStrategyProxy.address
    );

    expect(bankAdmin).eq(proxyAdmin.address);
    expect(aaveV2Admin).eq(proxyAdmin.address);
    expect(compoundAdmin).eq(proxyAdmin.address);
    expect(curve3PoolAdmin).eq(proxyAdmin.address);
  });

  it('proxyAdmin implementations are set correctly for all contracts', async () => {
    const {
      proxyAdmin,
      bankLogic,
      bankProxy,
      aaveV2StrategyLogic,
      aaveV2StrategyProxy,
      compoundStrategyLogic,
      compoundStrategyProxy,
      curve3PoolStrategyLogic,
      curve3PoolStrategyProxy,
    } = fixture;

    const bankImplementation = await proxyAdmin.getProxyImplementation(
      bankProxy.address
    );
    const aaveV2Implementation = await proxyAdmin.getProxyImplementation(
      aaveV2StrategyProxy.address
    );
    const compoundImplementation = await proxyAdmin.getProxyImplementation(
      compoundStrategyProxy.address
    );
    const curve3PoolImplementation = await proxyAdmin.getProxyImplementation(
      curve3PoolStrategyProxy.address
    );

    expect(bankImplementation).eq(bankLogic.address);
    expect(aaveV2Implementation).eq(aaveV2StrategyLogic.address);
    expect(compoundImplementation).eq(compoundStrategyLogic.address);
    expect(curve3PoolImplementation).eq(curve3PoolStrategyLogic.address);
  });
});
