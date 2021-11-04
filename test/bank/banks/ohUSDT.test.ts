import {expect} from 'chai';
import {advanceNBlocks, advanceNSeconds, ONE_DAY} from 'utils';
import {BankFixture, setupUsdtBankTest} from 'fixture';
import {getERC20Contract, swapEthForTokens} from 'lib';
import {ERC20} from 'types';
import {formatUnits, parseEther} from '@ethersproject/units';
import {getNamedAccounts} from 'hardhat';

describe('Oh! USDT', () => {
  let fixture: BankFixture;
  let usdt: ERC20;

  beforeEach(async () => {
    const addresses = await getNamedAccounts();
    fixture = await setupUsdtBankTest();
    const {worker} = fixture;

    usdt = await getERC20Contract(worker.address, addresses.usdt);

    // buy usdt for worker to use in tests
    await swapEthForTokens(worker.address, addresses.usdt, parseEther('100'));
  });

  it('deployed and initialized ohUSDT Bank proxy correctly', async () => {
    const {deployer} = fixture;
    const {bank} = deployer;

    const underlying = await bank.underlying();
    const decimals = await bank.decimals();
    const symbol = await bank.symbol();
    const name = await bank.name();

    expect(underlying).eq(usdt.address);
    expect(decimals).eq(6);
    expect(symbol).eq('OH-USDT');
    expect(name).eq('Oh! USDT');
  });

  it('added AaveV2, Compound, and Curve strategies to ohUSDT Bank correctly', async () => {
    const {deployer} = fixture;
    const {bank, aaveV2Strategy, compStrategy, crv3PoolStrategy} = deployer;

    const totalStrategies = await bank.totalStrategies();
    const aaveV2StrategyAddress = await bank.strategies(0);
    const compoundStrategyAddress = await bank.strategies(1);
    const curve3PoolStrategyAddress = await bank.strategies(2);

    expect(totalStrategies.toNumber()).eq(3);
    expect(aaveV2StrategyAddress).eq(aaveV2Strategy.address);
    expect(compoundStrategyAddress).eq(compStrategy.address);
    expect(curve3PoolStrategyAddress).eq(crv3PoolStrategy.address);
  });

  it('allows users to deposit and withdraw from the ohUSDT Bank', async () => {
    const {worker} = fixture;
    const {bank} = worker;

    const balance = await usdt.balanceOf(worker.address);

    await usdt.approve(bank.address, balance);
    await bank.deposit(balance);

    const bankBalance = await bank.underlyingBalance();
    const bankShares = await bank.balanceOf(worker.address);

    await bank.withdraw(bankShares);

    const remainingShares = await bank.balanceOf(worker.address);

    expect(bankBalance.toString()).eq(balance.toString());
    expect(bankShares.toString()).eq(balance.toString());
    expect(remainingShares.toNumber()).eq(0);
  });

  it('allows users to deposit and allows investing into ohUSDT Bank Stratgies', async () => {
    const {worker} = fixture;
    const {bank, manager} = worker;

    const balance = await usdt.balanceOf(worker.address);
    console.log('Starting Balance is:', formatUnits(balance.toString(), 6));
    await usdt.approve(bank.address, balance);

    const amount = balance.div(3);
    for (let i = 0; i < 3; i++) {
      await bank.deposit(amount);

      const bankBalance = await bank.underlyingBalance();

      expect(bankBalance).to.be.eq(amount);
      await manager.finance(bank.address);

      const strategyBalance = await bank.strategyBalance(i);
      console.log('Balance:', strategyBalance.toString());

      expect(strategyBalance).to.be.gt(0);

      await advanceNSeconds(ONE_DAY);
      await advanceNBlocks(1);
    }

    const virtualBalance = await bank.virtualBalance();
    const virtualPrice = await bank.virtualPrice();

    console.log('Virtual Balance is:', formatUnits(virtualBalance.toString(), 6));
    console.log('Virtual Price is:', formatUnits(virtualPrice.toString(), 6));

    const shares = await bank.balanceOf(worker.address);
    await bank.withdraw(shares.toString());

    const endBalance = await usdt.balanceOf(worker.address);
    console.log('Ending Balance is:', formatUnits(endBalance.toString(), 6));
  });
});
