import {expect} from 'chai';
import {bankFixture, BankFixture} from 'fixture';
import {addresses, execute} from 'utils';

describe('CompoundStrategy', async () => {
  let fixture: BankFixture;

  before(async () => {
    fixture = await bankFixture();
    const {manager, bankProxy, compoundStrategyProxy} = fixture;

    await execute(manager.setBank(bankProxy.address, true));
    await execute(
      manager.addStrategy(bankProxy.address, compoundStrategyProxy.address)
    );
  });

  it('deployed and initialized Compound USDC Strategy proxy correctly', async () => {
    const {bankProxy, compoundStrategyProxy} = fixture;

    const bank = await compoundStrategyProxy.bank();
    const underlying = await compoundStrategyProxy.underlying();
    const derivative = await compoundStrategyProxy.derivative();
    const reward = await compoundStrategyProxy.reward();
    const comptroller = await compoundStrategyProxy.comptroller();

    expect(bank).eq(bankProxy.address);
    expect(underlying).eq(addresses.usdc);
    expect(derivative).eq(addresses.compUsdcToken);
    expect(reward).eq(addresses.comp);
    expect(comptroller).eq(addresses.compComptroller);
  });
});
