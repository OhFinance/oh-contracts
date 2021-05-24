import {expect} from 'chai';
import {BankFixture, bankFixture} from 'fixture';
import {addresses, execute} from 'utils';

describe('Curve3PoolStrategy', () => {
  let fixture: BankFixture;

  before(async () => {
    fixture = await bankFixture();
    const {manager, bankProxy, curve3PoolStrategyProxy} = fixture;

    await execute(manager.setBank(bankProxy.address, true));
    await execute(
      manager.addStrategy(bankProxy.address, curve3PoolStrategyProxy.address)
    );
  });

  it('deployed and initialized Curve 3Pool USDC Strategy proxy correctly', async () => {
    const {bankProxy, curve3PoolStrategyProxy} = fixture;

    const bank = await curve3PoolStrategyProxy.bank();
    const underlying = await curve3PoolStrategyProxy.underlying();
    const derivative = await curve3PoolStrategyProxy.derivative();
    const reward = await curve3PoolStrategyProxy.reward();
    const pool = await curve3PoolStrategyProxy.pool();
    const gauge = await curve3PoolStrategyProxy.gauge();
    const mintr = await curve3PoolStrategyProxy.mintr();
    const index = await curve3PoolStrategyProxy.index();

    expect(bank).eq(bankProxy.address);
    expect(underlying).eq(addresses.usdc);
    expect(derivative).eq(addresses.crv3Token);
    expect(reward).eq(addresses.crv);
    expect(pool).eq(addresses.crv3Pool);
    expect(gauge).eq(addresses.crv3Gauge);
    expect(mintr).eq(addresses.crvMintr);
    expect(index.toNumber()).eq(1);
  });
});
