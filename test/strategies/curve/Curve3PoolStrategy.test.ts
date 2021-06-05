import {formatUnits, parseEther} from '@ethersproject/units';
import {expect} from 'chai';
import {BigNumber} from 'ethers';
import {BankFixture, setupBankTest} from 'fixture';
import {getNamedAccounts} from 'hardhat';
import {getErc20At} from 'lib';
import {ERC20} from 'types';
import {advanceNBlocks, advanceNSeconds, TEN_DAYS, swapEthForTokens} from 'utils';

describe('Curve3PoolStrategy', () => {
  let fixture: BankFixture;
  let usdc: ERC20;
  let startingBalance: BigNumber;

  before(async () => {
    fixture = await setupBankTest();
    const {deployer, worker} = fixture;
    const {manager, usdcBank, usdcCrv3PoolStrategy} = deployer;

    const addresses = await getNamedAccounts();
    usdc = await getErc20At(addresses.usdc, worker.address);

    await manager.setBank(usdcBank.address, true);
    await manager.addStrategy(usdcBank.address, usdcCrv3PoolStrategy.address);

    // Buy USDC using the worker wallet
    await swapEthForTokens(worker.address, addresses.usdc, parseEther('100'));

    // Check USDC balance and approve spending
    startingBalance = await usdc.balanceOf(worker.address);
    console.log('Starting Balance:', formatUnits(startingBalance.toString(), 6));
    await usdc.approve(usdcBank.address, startingBalance);
  });

  it('deployed and initialized Curve 3Pool USDC Strategy proxy correctly', async () => {
    const {deployer} = fixture;
    const {usdcBank, usdcCrv3PoolStrategy} = deployer;

    const {crv, crv3Token, crv3Pool, crv3Gauge, crvMintr} = await getNamedAccounts();
    const bank = await usdcCrv3PoolStrategy.bank();
    const underlying = await usdcCrv3PoolStrategy.underlying();
    const derivative = await usdcCrv3PoolStrategy.derivative();
    const reward = await usdcCrv3PoolStrategy.reward();
    const pool = await usdcCrv3PoolStrategy.pool();
    const gauge = await usdcCrv3PoolStrategy.gauge();
    const mintr = await usdcCrv3PoolStrategy.mintr();
    const index = await usdcCrv3PoolStrategy.index();

    expect(bank).eq(usdcBank.address);
    expect(underlying).eq(usdc.address);
    expect(derivative).eq(crv3Token);
    expect(reward).eq(crv);
    expect(pool).eq(crv3Pool);
    expect(gauge).eq(crv3Gauge);
    expect(mintr).eq(crvMintr);
    expect(index).to.be.eq(1);
  });

  it('finances and deposits into Curve 3Pool', async () => {
    const {worker} = fixture;
    const {manager, usdcBank} = worker;

    // Deposit the USDC in the Bank
    await usdcBank.deposit(startingBalance);
    const bankBalance = await usdcBank.underlyingBalance();

    // Check that tha Bank now has proper amount of USDC deposited
    expect(bankBalance).to.be.eq(startingBalance);

    // Invest the initial USDC into the strategy
    await manager.finance(usdcBank.address);

    const strategyBalance = await usdcBank.strategyBalance(0);
    console.log('Strategy Balance: ' + formatUnits(strategyBalance.toString(), 6));

    expect(strategyBalance).to.be.gt(0);
  });

  it('liquidates rewards and compounds deposit', async () => {
    const {worker} = fixture;
    const {manager, usdcBank, usdcCrv3PoolStrategy} = worker;

    // wait ~1 day in blocks to accrue rewards (comptroller rewards are block-based)
    await advanceNSeconds(TEN_DAYS);
    await advanceNBlocks(1);

    // finance to claim CRV from Gauge and trigger liquidation
    const balanceBefore = await usdcCrv3PoolStrategy.investedBalance();

    await manager.finance(usdcBank.address);

    const balanceAfter = await usdcCrv3PoolStrategy.investedBalance();
    console.log('Liquidated CRV for', formatUnits(balanceAfter.sub(balanceBefore), 6), 'USDC');

    const strategyBalance = await usdcBank.strategyBalance(0);
    console.log('Strategy Balance: ' + formatUnits(strategyBalance.toString(), 6));

    // expect liquidation was profitable
    expect(balanceAfter).to.be.gt(balanceBefore);
    expect(strategyBalance).to.be.gt(0);
  });

  it('exits all and is profitable', async () => {
    const {worker, deployer} = fixture;
    const {manager} = deployer;
    const {usdcBank, usdcCompStrategy} = worker;

    // Withdraw all from the strategy to the bank
    await manager.exit(usdcBank.address, usdcCompStrategy.address);

    // Check that underlying balance for the user is now greater than when the test started
    const virtualBalance = await usdcBank.virtualBalance();
    const virtualPrice = await usdcBank.virtualPrice();

    console.log('Virtual Balance:', formatUnits(virtualBalance.toString(), 6));
    console.log('Virtual Price:', formatUnits(virtualPrice.toString(), 6));

    const shares = await usdcBank.balanceOf(worker.address);
    await usdcBank.withdraw(shares.toString());

    const endingBalance = await usdc.balanceOf(worker.address);
    expect(startingBalance).to.be.lt(endingBalance);

    console.log('Ending Balance: ' + formatUnits(endingBalance.toString(), 6));
  });
});
