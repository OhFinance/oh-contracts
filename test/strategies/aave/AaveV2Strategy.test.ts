import {expect} from 'chai';
import {BankFixture, bankFixture} from 'fixture';
import {addresses, advanceNBlocks, advanceNSeconds, getDecimalString} from 'utils';
import {getErc20At, swapEthForTokens} from 'lib';
import {formatUnits} from '@ethersproject/units';

const TEN_DAYS = 86400 * 10;

describe('AaveV2Strategy', () => {
  let fixture: BankFixture;

  before(async () => {
    fixture = await bankFixture();
    const {manager, bankProxy, aaveV2StrategyProxy} = fixture;

    await manager.setBank(bankProxy.address, true);
    await manager.addStrategy(bankProxy.address, aaveV2StrategyProxy.address);

    // Buy USDC using the worker wallet
    await swapEthForTokens(fixture.worker, addresses.usdc, getDecimalString(100));
  });

  it('deployed and initialized AaveV2 USDC Strategy proxy correctly', async () => {
    const {bankProxy, aaveV2StrategyProxy} = fixture;

    const bank = await aaveV2StrategyProxy.bank();
    const underlying = await aaveV2StrategyProxy.underlying();
    const derivative = await aaveV2StrategyProxy.derivative();
    const reward = await aaveV2StrategyProxy.reward();
    const stakedToken = await aaveV2StrategyProxy.stakedToken();
    const lendingPool = await aaveV2StrategyProxy.lendingPool();
    const incentivesController = await aaveV2StrategyProxy.incentivesController();

    expect(bank).eq(bankProxy.address);
    expect(underlying).eq(addresses.usdc);
    expect(derivative).eq(addresses.aaveUsdcToken);
    expect(reward).eq(addresses.aave);
    expect(stakedToken).eq(addresses.aaveStakedToken);
    expect(lendingPool).eq(addresses.aaveLendingPool);
    expect(incentivesController).eq(addresses.aaveIncentivesController);
  });

  it('is able to claim rewards and compound on AaveV2Strategy', async () => {
    const {bankProxy, manager, worker, aaveV2StrategyProxy} = fixture;

    // Check USDC balance and approve spending
    const usdc = await getErc20At(addresses.usdc, worker);
    const workerStartingBalance = await usdc.balanceOf(worker.address);
    console.log('Starting Balance:', formatUnits(workerStartingBalance.toString(), 6));
    await usdc.approve(bankProxy.address, workerStartingBalance);

    // Deposit the USDC in the Bank
    await bankProxy.connect(worker).deposit(workerStartingBalance);
    const bankBalance = await bankProxy.underlyingBalance();

    // Check that tha Bank now has proper amount of USDC deposited
    expect(bankBalance.toString()).eq(workerStartingBalance.toString());

    // Invest the initial USDC into the strategy
    await manager.finance(bankProxy.address);
    const startingBalance = await bankProxy.strategyBalance(0);
    console.log('Strategy starting balance: ' + formatUnits(startingBalance.toString(), 6));

    // loop
    for (let i = 0; i < 3; i++) {
      // Simulate 48 hours of waiting
      await advanceNSeconds(TEN_DAYS);
      await advanceNBlocks(1);

      // Check strategy invested balance (also check that the strategy balance through bank is the same)
      const strategyBalance = await aaveV2StrategyProxy.investedBalance();
      const strategyBankBalance = await bankProxy.strategyBalance(0);
      expect(strategyBalance).to.be.eq(strategyBankBalance);
      console.log('Strategy balance [' + i.toString() + ']: ' + formatUnits(strategyBalance.toString(), 6));

      // Check strategy staked balance
      const stakedBalance = await aaveV2StrategyProxy.stakedBalance();
      console.log('Strategy stkAAVE balance: ' + formatUnits(stakedBalance.toString()));

      // Finance will invest underlying (if any), liquidate the rewards to underlying,
      // and re-invest the collected underlying
      await manager.finance(bankProxy.address);
    }

    // Withdraw all from the strategy to the bank
    await manager.exit(bankProxy.address, aaveV2StrategyProxy.address);

    // Check that underlying balance for the user is now greater than when the test started
    const virtualBalance = await bankProxy.virtualBalance();
    const virtualPrice = await bankProxy.virtualPrice();

    console.log('Virtual Balance:', formatUnits(virtualBalance.toString(), 6));
    console.log('Virtual Price:', formatUnits(virtualPrice.toString(), 6));

    const shares = await bankProxy.balanceOf(worker.address);
    await bankProxy.connect(worker).withdraw(shares.toString());

    const workerEndingBalance = await usdc.balanceOf(worker.address);
    expect(workerStartingBalance).to.be.lt(workerEndingBalance);

    console.log(
      'Starting balance: ' +
        formatUnits(workerStartingBalance.toString(), 6) +
        '\n' +
        'Ending Balance:' +
        formatUnits(workerEndingBalance.toString(), 6)
    );
  });
});
