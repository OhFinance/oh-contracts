import {formatUnits, parseEther} from '@ethersproject/units';
import {expect} from 'chai';
import {BigNumber} from 'ethers';
import {BankFixture, setupBankTest} from 'fixture';
import {getNamedAccounts} from 'hardhat';
import {getErc20At} from 'lib';
import {swapEthForTokens} from 'utils';
import {ERC20} from 'types';
import {advanceNBlocks, advanceNSeconds, TEN_DAYS} from 'utils';

describe('CompoundStrategy', () => {
  let fixture: BankFixture;
  let usdc: ERC20;
  let startingBalance: BigNumber;

  before(async () => {
    fixture = await setupBankTest();
    const {worker, deployer} = fixture;
    const {manager, usdcBank, usdcCompStrategy} = deployer;

    const addresses = await getNamedAccounts();
    usdc = await getErc20At(addresses.usdc, worker.address);

    await manager.setBank(usdcBank.address, true);
    await manager.addStrategy(usdcBank.address, usdcCompStrategy.address);

    // Buy USDC using the worker wallet
    await swapEthForTokens(worker.address, addresses.usdc, parseEther('100'));

    // Check USDC balance and approve spending
    startingBalance = await usdc.balanceOf(worker.address);
    console.log('Starting Balance:', formatUnits(startingBalance.toString(), 6));
    await usdc.approve(usdcBank.address, startingBalance);
  });

  it('deployed and initialized Compound USDC Strategy proxy correctly', async () => {
    const {deployer} = fixture;
    const {usdcBank, usdcCompStrategy} = deployer;

    const {compUsdcToken, comp, compComptroller} = await getNamedAccounts();
    const bank = await usdcCompStrategy.bank();
    const underlying = await usdcCompStrategy.underlying();
    const derivative = await usdcCompStrategy.derivative();
    const reward = await usdcCompStrategy.reward();
    const comptroller = await usdcCompStrategy.comptroller();

    expect(bank).eq(usdcBank.address);
    expect(underlying).eq(usdc.address);
    expect(derivative).eq(compUsdcToken);
    expect(reward).eq(comp);
    expect(comptroller).eq(compComptroller);
  });

  it('finances and deposits into Compound', async () => {
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
    const {manager, usdcBank, usdcCompStrategy} = worker;

    // wait ~1 day in blocks to accrue rewards (comptroller rewards are block-based)
    await advanceNBlocks(6000);

    // finance to claim COMP and trigger liquidation
    const balanceBefore = await usdcCompStrategy.investedBalance();

    await manager.finance(usdcBank.address);

    const balanceAfter = await usdcCompStrategy.investedBalance();
    console.log('Liquidated COMP for', formatUnits(balanceAfter.sub(balanceBefore), 6), 'USDC');

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
