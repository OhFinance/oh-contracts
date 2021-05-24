import {expect} from 'chai';
import {BankFixture, bankFixture} from 'fixture';
import {addresses, execute} from 'utils';

describe('AaveV2Strategy', () => {
  let fixture: BankFixture;

  before(async () => {
    fixture = await bankFixture();
    const {manager, bankProxy, aaveV2StrategyProxy} = fixture;

    await execute(manager.setBank(bankProxy.address, true));
    await execute(
      manager.addStrategy(bankProxy.address, aaveV2StrategyProxy.address)
    );
  });

  it('deployed and initialized AaveV2 USDC Strategy proxy correctly', async () => {
    const {bankProxy, aaveV2StrategyProxy} = fixture;

    const bank = await aaveV2StrategyProxy.bank();
    const underlying = await aaveV2StrategyProxy.underlying();
    const derivative = await aaveV2StrategyProxy.derivative();
    const reward = await aaveV2StrategyProxy.reward();
    const lendingPool = await aaveV2StrategyProxy.lendingPool();
    const incentiveController = await aaveV2StrategyProxy.incentiveController();

    expect(bank).eq(bankProxy.address);
    expect(underlying).eq(addresses.usdc);
    expect(derivative).eq(addresses.aaveUsdcToken);
    expect(reward).eq(addresses.aave);
    expect(lendingPool).eq(addresses.aaveLendingPool);
    expect(incentiveController).eq(addresses.aaveIncentivesController);
  });
});
