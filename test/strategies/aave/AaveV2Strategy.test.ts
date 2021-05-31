import {expect} from 'chai';
import {BankFixture, bankFixture} from 'fixture';
import {addresses, execute, getDecimalString} from 'utils';
import {getErc20At, swapEthForTokens} from 'lib';
import {formatUnits} from '@ethersproject/units';
import {network} from 'hardhat';

describe('AaveV2Strategy', () => {
  let fixture: BankFixture;

  before(async () => {
    fixture = await bankFixture();
    const {manager, bankProxy, aaveV2StrategyProxy} = fixture;

    await execute(manager.setBank(bankProxy.address, true));
    await execute(manager.addStrategy(bankProxy.address, aaveV2StrategyProxy.address));
  });

  it('deployed and initialized AaveV2 USDC Strategy proxy correctly', async () => {
    const {bankProxy, aaveV2StrategyProxy} = fixture;

    const bank = await aaveV2StrategyProxy.bank();
    const underlying = await aaveV2StrategyProxy.underlying();
    const derivative = await aaveV2StrategyProxy.derivative();
    const reward = await aaveV2StrategyProxy.reward();
    const lendingPool = await aaveV2StrategyProxy.lendingPool();
    const incentivesController = await aaveV2StrategyProxy.incentivesController();

    expect(bank).eq(bankProxy.address);
    expect(underlying).eq(addresses.usdc);
    expect(derivative).eq(addresses.aaveUsdcToken);
    expect(reward).eq(addresses.aave);
    expect(lendingPool).eq(addresses.aaveLendingPool);
    expect(incentivesController).eq(addresses.aaveIncentivesController);
  });

  it('is able to claim rewards and compound on AaveV2Strategy', async () => {
    let { bankProxy, manager, worker, aaveV2StrategyProxy } = fixture;
    bankProxy = bankProxy.connect(fixture.worker);

    // Buy USDC using the worker wallet
    const usdc = await getErc20At(addresses.usdc, fixture.worker);
    await swapEthForTokens(
      fixture.worker,
      addresses.usdc,
      getDecimalString(100)
    );

    // Check USDC balance and approve spending
    const workerStartingBalance = await usdc.balanceOf(worker.address);
    console.log('Starting Balance:', formatUnits(workerStartingBalance.toString(), 6));
    await execute(usdc.approve(bankProxy.address, workerStartingBalance));

    // Deposit the USDC in the Bank
    await execute(bankProxy.deposit(workerStartingBalance));
    const bankBalance = await bankProxy.underlyingBalance();

    // Check that tha Bank now has proper amount of USDC deposited
    expect(bankBalance.toString()).eq(workerStartingBalance.toString());

    // Invest the USDC into the strategy
    await execute(manager.finance(bankProxy.address));
    let strategyBalance = await bankProxy.strategyBalance(0);
    console.log('Strategy starting balance: ' + formatUnits(strategyBalance.toString(), 6));

    let rewardBalance;
    let strategyBankBalance;
    for (let i = 0; i < 3; i++) {
      const twoDays = 86400 * 2;
      // Simulate 48 hours of waiting
      await network.provider.send('evm_increaseTime', [twoDays]);

      // Mine the next block 48 hours later
      await network.provider.send('evm_mine');

      // Check strategy invested balance (also check that the strategy balance through bank is the same)
      strategyBalance = await aaveV2StrategyProxy.investedBalance();
      strategyBankBalance = await bankProxy.strategyBalance(0);
      expect(strategyBalance.toString()).eq(strategyBankBalance.toString());
      console.log('Strategy balance [' + i.toString() + ']: ' + formatUnits(strategyBalance.toString(), 6));

      // Check strategy reward balance
      rewardBalance = await aaveV2StrategyProxy.rewardBalance();
      console.log('Strategy reward balance: ' + formatUnits(rewardBalance.toString(), 6));

      // Finance will invest underlying (if any), liquidate the rewards to underlying,
      // and re-invest the collected underlying
      await execute(manager.finance(bankProxy.address));
    }

    // Withdraw all from the strategy to the bank
    await execute(manager.rebalance(bankProxy.address));

    // Check that underlying balance for the user is now greater than when the test started
    const virtualBalance = await bankProxy.virtualBalance();
    const virtualPrice = await bankProxy.virtualPrice();

    console.log(
      'Virtual Balance:',
      formatUnits(virtualBalance.toString(), 6)
    );
    console.log('Virtual Price:', formatUnits(virtualPrice.toString(), 6));

    const shares = await bankProxy.balanceOf(worker.address);
    await execute(bankProxy.withdraw(shares.toString()));

    const workerEndingBalance = await usdc.balanceOf(worker.address);
    expect(workerStartingBalance.lt(workerEndingBalance)).to.be.true;

    console.log('Starting balance: ' + formatUnits(workerStartingBalance.toString(), 6) + '\n' +
      'Ending Balance:' + formatUnits(workerEndingBalance.toString(), 6));
  });
});
