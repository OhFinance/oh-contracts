import {expect} from 'chai';
import {signMessageData} from 'utils';
import {BankFixture, setupUsdcBankTest} from 'fixture';
import {getErc20At, getPermitMessageData, swapEthForTokens} from 'lib';
import {ERC20} from 'types';
import {formatUnits, parseEther} from '@ethersproject/units';
import {getNamedAccounts} from 'hardhat';

describe('ohUSDC', () => {
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

  it('deployed and initialized ohUSDC Bank proxy correctly', async () => {
    const {deployer} = fixture;
    const {usdcBank} = deployer;

    const underlying = await usdcBank.underlying();
    const decimals = await usdcBank.decimals();
    const symbol = await usdcBank.symbol();
    const name = await usdcBank.name();

    expect(underlying).eq(usdc.address);
    expect(decimals).eq(6);
    expect(symbol).eq('Oh! USDC');
    expect(name).eq('Oh! USDC');
  });

  it('added AaveV2, Compound, and Curve strategies to ohUSDC Bank correctly', async () => {
    const {deployer} = fixture;
    const {usdcBank, usdcAaveV2Strategy, usdcCompStrategy, usdcCrv3PoolStrategy} = deployer;

    const totalStrategies = await usdcBank.totalStrategies();
    const aaveV2StrategyAddress = await usdcBank.strategies(0);
    const compoundStrategyAddress = await usdcBank.strategies(1);
    const curve3PoolStrategyAddress = await usdcBank.strategies(2);

    expect(totalStrategies.toNumber()).eq(3);
    expect(aaveV2StrategyAddress).eq(usdcAaveV2Strategy.address);
    expect(compoundStrategyAddress).eq(usdcCompStrategy.address);
    expect(curve3PoolStrategyAddress).eq(usdcCrv3PoolStrategy.address);
  });

  it('allows users to deposit with permit', async () => {
    const {worker} = fixture;
    const {usdcBank} = worker;

    // sign permit message for usdc
    const balance = await usdc.balanceOf(worker.address);
    const {message, data} = getPermitMessageData(
      'USD Coin',
      '2',
      usdc.address,
      worker.address,
      usdcBank.address,
      balance.toString(),
      0,
      Date.now() + 900
    );
    const {v, r, s} = await signMessageData(worker.address, data);

    await usdcBank.depositWithPermit(balance, worker.address, message.deadline, v, r, s);

    const shares = await usdcBank.balanceOf(worker.address);
    expect(shares).to.be.eq(balance);
  });

  it('allows users to deposit and withdraw from the ohUSDC Bank', async () => {
    const {worker} = fixture;
    const {usdcBank} = worker;

    const balance = await usdc.balanceOf(worker.address);

    await usdc.approve(usdcBank.address, balance);
    await usdcBank.deposit(balance);

    const bankBalance = await usdcBank.underlyingBalance();
    const bankShares = await usdcBank.balanceOf(worker.address);

    await usdcBank.withdraw(bankShares);

    const remainingShares = await usdcBank.balanceOf(worker.address);

    expect(bankBalance.toString()).eq(balance.toString());
    expect(bankShares.toString()).eq(balance.toString());
    expect(remainingShares.toNumber()).eq(0);
  });

  it('allows users to deposit and allows investing into ohUSDC Bank Stratgies', async () => {
    const {worker} = fixture;
    const {usdcBank, manager} = worker;

    const balance = await usdc.balanceOf(worker.address);
    console.log('Starting Balance is:', formatUnits(balance.toString(), 6));
    await usdc.approve(usdcBank.address, balance);

    const amount = balance.div(3);
    for (let i = 0; i < 3; i++) {
      await usdcBank.deposit(amount);

      const bankBalance = await usdcBank.underlyingBalance();

      expect(bankBalance).to.be.eq(amount);
      await manager.finance(usdcBank.address);

      const strategyBalance = await usdcBank.strategyBalance(i);
      console.log('Balance:', strategyBalance.toString());

      expect(strategyBalance).to.be.gt(0);
    }

    const virtualBalance = await usdcBank.virtualBalance();
    const virtualPrice = await usdcBank.virtualPrice();

    console.log('Virtual Balance is:', formatUnits(virtualBalance.toString(), 6));
    console.log('Virtual Price is:', formatUnits(virtualPrice.toString(), 6));

    const shares = await usdcBank.balanceOf(worker.address);
    await usdcBank.withdraw(shares.toString());

    const endBalance = await usdc.balanceOf(worker.address);
    console.log('Ending Balance is:', formatUnits(endBalance.toString(), 6));
  });
});
