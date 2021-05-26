import {expect} from 'chai';
import {addresses, execute, getDecimalString, signMessageData} from 'utils';
import {ohUsdcFixture, OhUsdcFixture} from 'fixture';
import {getErc20At, getPermitMessageData, swapEthForTokens} from 'lib';
import {ERC20} from 'types';
import {formatUnits} from '@ethersproject/units';

describe('ohUSDC', () => {
  let fixture: OhUsdcFixture;
  let usdc: ERC20;

  beforeEach(async () => {
    fixture = await ohUsdcFixture();
    usdc = await getErc20At(addresses.usdc, fixture.worker);

    // buy usdc for worker to use in tests
    await swapEthForTokens(
      fixture.worker,
      addresses.usdc,
      getDecimalString(100)
    );
  });

  it('deployed and initialized ohUSDC Bank proxy correctly', async () => {
    const {bankProxy} = fixture;

    const underlying = await bankProxy.underlying();
    const decimals = await bankProxy.decimals();
    const symbol = await bankProxy.symbol();
    const name = await bankProxy.name();

    expect(underlying).eq(addresses.usdc);
    expect(decimals).eq(6);
    expect(symbol).eq('Oh! USDC');
    expect(name).eq('Oh! USDC');
  });

  it('added AaveV2, Compound, and Curve strategies to ohUSDC Bank correctly', async () => {
    const {
      bankProxy,
      aaveV2StrategyProxy,
      compoundStrategyProxy,
      curve3PoolStrategyProxy,
    } = fixture;

    const totalStrategies = await bankProxy.totalStrategies();
    const aaveV2StrategyAddress = await bankProxy.strategies(0);
    const compoundStrategyAddress = await bankProxy.strategies(1);
    const curve3PoolStrategyAddress = await bankProxy.strategies(2);

    expect(totalStrategies.toNumber()).eq(3);
    expect(aaveV2StrategyAddress).eq(aaveV2StrategyProxy.address);
    expect(compoundStrategyAddress).eq(compoundStrategyProxy.address);
    expect(curve3PoolStrategyAddress).eq(curve3PoolStrategyProxy.address);
  });

  it('allows users to deposit with permit', async () => {
    let {bankProxy, worker} = fixture;
    bankProxy = bankProxy.connect(worker);

    const balance = await usdc.balanceOf(worker.address);
    console.log(balance.toString());
    const {message, data} = getPermitMessageData(
      'USD Coin',
      '2',
      addresses.usdc,
      worker.address,
      bankProxy.address,
      balance.toString(),
      0,
      Date.now() + 900
    );

    const {v, r, s} = await signMessageData(worker.address, data);

    await execute(
      bankProxy.depositWithPermit(
        balance,
        worker.address,
        message.deadline,
        v,
        r,
        s
      )
    );

    const shares = await bankProxy.balanceOf(worker.address);
    expect(shares).to.be.eq(balance);
  });

  it('allows users to deposit and withdraw from the ohUSDC Bank', async () => {
    let {bankProxy, worker} = fixture;
    bankProxy = bankProxy.connect(worker);

    const balance = await usdc.balanceOf(worker.address);

    await execute(usdc.approve(bankProxy.address, balance));
    await execute(bankProxy.deposit(balance));

    const bankBalance = await bankProxy.underlyingBalance();
    const bankShares = await bankProxy.balanceOf(worker.address);

    await execute(bankProxy.withdraw(bankShares));

    const remainingShares = await bankProxy.balanceOf(worker.address);

    expect(bankBalance.toString()).eq(balance.toString());
    expect(bankShares.toString()).eq(balance.toString());
    expect(remainingShares.toNumber()).eq(0);
  });

  it('allows users to deposit and allows investing into ohUSDC Bank Stratgies', async () => {
    let {bankProxy, manager, worker} = fixture;
    bankProxy = bankProxy.connect(fixture.worker);

    const balance = await usdc.balanceOf(worker.address);
    console.log('Starting Balance is:', formatUnits(balance.toString(), 6));
    await execute(usdc.approve(bankProxy.address, balance));

    const amount = balance.div(3);
    for (let i = 0; i < 3; i++) {
      await execute(bankProxy.deposit(amount));

      const bankBalance = await bankProxy.underlyingBalance();

      expect(bankBalance.toString()).eq(amount.toString());
      await execute(manager.finance(bankProxy.address));

      const strategyBalance = await bankProxy.strategyBalance(i);
      console.log(strategyBalance.toString());

      expect(strategyBalance.gt(0)).true;
    }

    const virtualBalance = await bankProxy.virtualBalance();
    const virtualPrice = await bankProxy.virtualPrice();

    console.log(
      'Virtual Balance is:',
      formatUnits(virtualBalance.toString(), 6)
    );
    console.log('Virtual Price is:', formatUnits(virtualPrice.toString(), 6));

    const shares = await bankProxy.balanceOf(worker.address);
    await execute(bankProxy.withdraw(shares.toString()));

    const endBalance = await usdc.balanceOf(worker.address);
    console.log('Ending Balance is:', formatUnits(endBalance.toString(), 6));
  });
});
