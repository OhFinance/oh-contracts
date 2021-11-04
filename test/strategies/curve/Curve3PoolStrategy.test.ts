import {formatUnits, parseEther} from '@ethersproject/units';
import {expect} from 'chai';
import {BigNumber} from 'ethers';
import {BankFixture, setupBankTest} from 'fixture';
import {getNamedAccounts} from 'hardhat';
import {getERC20Contract, swapEthForTokens} from 'lib';
import {ERC20} from 'types';
import {advanceNBlocks, advanceNSeconds, TEN_DAYS} from 'utils';

describe('Curve3PoolStrategy', () => {
  let fixture: BankFixture;
  let usdc: ERC20;
  let startingBalance: BigNumber;

  before(async () => {
    fixture = await setupBankTest();
    const {deployer, worker} = fixture;
    const {manager, bank, crv3PoolStrategy} = deployer;

    const addresses = await getNamedAccounts();
    usdc = await getERC20Contract(worker.address, addresses.usdc);

    await manager.setBank(bank.address, true);
    await manager.setStrategy(bank.address, crv3PoolStrategy.address, true);

    // Buy USDC using the worker wallet
    await swapEthForTokens(worker.address, addresses.usdc, parseEther('100'));

    // Check USDC balance and approve spending
    startingBalance = await usdc.balanceOf(worker.address);
    console.log('Starting Balance:', formatUnits(startingBalance.toString(), 6));
    await usdc.approve(bank.address, startingBalance);
  });

  it('deployed and initialized Curve 3Pool USDC Strategy proxy correctly', async () => {
    const {deployer} = fixture;
    const {bankProxy, crv3PoolStrategy} = deployer;

    const {crv, crv3Token, crv3Pool, crv3Gauge, crvMintr} = await getNamedAccounts();
    const crvBank = await crv3PoolStrategy.bank();
    const underlying = await crv3PoolStrategy.underlying();
    const derivative = await crv3PoolStrategy.derivative();
    const reward = await crv3PoolStrategy.reward();
    const pool = await crv3PoolStrategy.pool();
    const gauge = await crv3PoolStrategy.gauge();
    const mintr = await crv3PoolStrategy.mintr();
    const index = await crv3PoolStrategy.index();

    expect(crvBank).eq(bankProxy.address);
    expect(underlying).eq(usdc.address);0
    expect(derivative).eq(crv3Token);
    expect(reward).eq(crv);
    expect(pool).eq(crv3Pool);
    expect(gauge).eq(crv3Gauge);
    expect(mintr).eq(crvMintr);
    expect(index).to.be.eq(1);
  });

  it('finances and deposits into Curve 3Pool', async () => {
    const {worker} = fixture;
    const {manager, bank} = worker;

    // Deposit the USDC in the Bank
    await bank.deposit(startingBalance);
    const bankBalance = await bank.underlyingBalance();

    // Check that tha Bank now has proper amount of USDC deposited
    expect(bankBalance).to.be.eq(startingBalance);

    // Invest the initial USDC into the strategy
    await manager.finance(bank.address);

    const strategyBalance = await bank.strategyBalance(0);
    console.log('Strategy Balance: ' + formatUnits(strategyBalance.toString(), 6));

    expect(strategyBalance).to.be.gt(0);
  });

  it('liquidates rewards and compounds deposit', async () => {
    const {worker} = fixture;
    const {manager, bank, crv3PoolStrategy} = worker;

    // wait ~1 day in blocks to accrue rewards (comptroller rewards are block-based)
    await advanceNSeconds(TEN_DAYS);
    await advanceNBlocks(1);

    // finance to claim CRV from Gauge and trigger liquidation
    const balanceBefore = await crv3PoolStrategy.investedBalance();

    await manager.finance(bank.address);

    const balanceAfter = await crv3PoolStrategy.investedBalance();
    console.log('Liquidated CRV for', formatUnits(balanceAfter.sub(balanceBefore), 6), 'USDC');

    const strategyBalance = await bank.strategyBalance(0);
    console.log('Strategy Balance: ' + formatUnits(strategyBalance.toString(), 6));

    // expect liquidation was profitable
    expect(balanceAfter).to.be.gt(balanceBefore);
    expect(strategyBalance).to.be.gt(0);
  });

  it('exits all and is profitable', async () => {
    const {worker, deployer} = fixture;
    const {manager} = deployer;
    const {bank, compStrategy} = worker;

    // Withdraw all from the strategy to the bank
    await manager.exit(bank.address, compStrategy.address);

    // Check that underlying balance for the user is now greater than when the test started
    const virtualBalance = await bank.virtualBalance();
    const virtualPrice = await bank.virtualPrice();

    console.log('Virtual Balance:', formatUnits(virtualBalance.toString(), 6));
    console.log('Virtual Price:', formatUnits(virtualPrice.toString(), 6));

    const shares = await bank.balanceOf(worker.address);
    await bank.withdraw(shares.toString());

    const endingBalance = await usdc.balanceOf(worker.address);
    expect(startingBalance).to.be.lt(endingBalance);

    console.log('Ending Balance: ' + formatUnits(endingBalance.toString(), 6));
  });
});
7