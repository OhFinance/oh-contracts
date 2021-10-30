import {expect} from 'chai';
import {advanceNBlocks, advanceNSeconds, ONE_DAY, signMessageData, swapEthForTokens} from 'utils';
import {BankFixture, setupUsdcBankTest} from 'fixture';
import {getErc20At, getPermitMessageData} from 'lib';
import {ERC20} from 'types';
import {formatUnits, parseEther} from '@ethersproject/units';
import {getNamedAccounts} from 'hardhat';

describe('Oh! USDC', () => {
  let fixture: BankFixture;
  let usdc: ERC20;

  beforeEach(async () => {
    const addresses = await getNamedAccounts();
    fixture = await setupUsdcBankTest();
    const {worker} = fixture;

    usdc = await getErc20At(addresses.usdc, worker.address);

    // buy usdc for worker to use in tests
    await swapEthForTokens(worker.address, addresses.usdc, parseEther('100'));
  });

  it('deployed and initialized Oh! USDC Bank proxy correctly', async () => {
    const {deployer} = fixture;
    const {bank} = deployer;

    const underlying = await bank.underlying();
    const decimals = await bank.decimals();
    const symbol = await bank.symbol();
    const name = await bank.name();

    expect(underlying).eq(usdc.address);
    expect(decimals).eq(6);
    expect(symbol).eq('OH-USDC');
    expect(name).eq('Oh! USDC');
  });

  it('added AaveV2, Compound, and Curve strategies to Oh! USDC Bank correctly', async () => {
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

  it('allows users to deposit with permit', async () => {
    const {worker} = fixture;
    const {bank} = worker;

    // sign permit message for usdc
    const balance = await usdc.balanceOf(worker.address);
    const {message, data} = getPermitMessageData(
      'USD Coin',
      '2',
      usdc.address,
      worker.address,
      bank.address,
      balance.toString(),
      0,
      Date.now() + 900
    );
    const {v, r, s} = await signMessageData(worker.address, data);

    await bank.depositWithPermit(balance, worker.address, message.deadline, v, r, s);

    const shares = await bank.balanceOf(worker.address);
    expect(shares).to.be.eq(balance);
  });

  it('allows one user to deposit and withdraw from the Oh! USDC Bank', async () => {
    const {worker} = fixture;
    const {bank} = worker;

    const balance = await usdc.balanceOf(worker.address);

    await usdc.approve(bank.address, balance);
    await bank.deposit(balance);

    const bankBalance = await bank.underlyingBalance();
    const bankShares = await bank.balanceOf(worker.address);

    await bank.withdraw(bankShares);

    const remainingShares = await bank.balanceOf(worker.address);

    expect(bankBalance.toString()).eq(balance.toString());
    expect(bankShares.toString()).eq(balance.toString());
    expect(remainingShares.toNumber()).eq(0);
  });

  it('allows users to deposit and allows investing into Oh! USDC Bank Stratgies', async () => {
    const {worker} = fixture;
    const {bank, manager} = worker;

    const balance = await usdc.balanceOf(worker.address);
    console.log('Starting Balance is:', formatUnits(balance.toString(), 6));
    await usdc.approve(bank.address, balance);

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

    let batch = shares.div(10);
    const withdrawCount = 6;
    for (let i = 0; i < withdrawCount; i++) {
      await bank.withdraw(batch.toString());
    }

    let remainingShares = await bank.balanceOf(worker.address);

    await bank.withdraw(remainingShares.toString());

    const endBalance = await usdc.balanceOf(worker.address);
    console.log('Ending Balance is:', formatUnits(endBalance.toString(), 6));
  });
});
