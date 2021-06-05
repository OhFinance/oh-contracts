import {expect} from 'chai';
import {BankFixture, setupBankTest} from 'fixture';
import {
  advanceNBlocks,
  advanceNSeconds,
  FIFTEEN_DAYS,
  getLatestBlock,
  NINE_DAYS,
  ONE_DAY,
  TEN_DAYS,
} from 'utils';
import {getErc20At} from 'lib';
import {swapEthForTokens} from 'utils';
import {formatUnits, parseEther} from '@ethersproject/units';
import {getNamedAccounts} from 'hardhat';
import {ERC20} from 'types';
import {BigNumber} from '@ethersproject/bignumber';

describe('AaveV2Strategy', function () {
  let fixture: BankFixture;
  let usdc: ERC20;
  let startingBalance: BigNumber;

  before(async function () {
    fixture = await setupBankTest();
    const {worker, deployer} = fixture;
    const {manager, usdcBank, usdcAaveV2Strategy} = deployer;

    const addresses = await getNamedAccounts();
    usdc = await getErc20At(addresses.usdc, worker.address);

    await manager.setBank(usdcBank.address, true);
    await manager.addStrategy(usdcBank.address, usdcAaveV2Strategy.address);

    // Buy USDC using the worker wallet
    await swapEthForTokens(worker.address, addresses.usdc, parseEther('100'));

    // Check USDC balance and approve spending
    startingBalance = await usdc.balanceOf(worker.address);
    console.log('Starting Balance:', formatUnits(startingBalance.toString(), 6));
    await usdc.approve(usdcBank.address, startingBalance);
  });

  it('deployed and initialized AaveV2 USDC Strategy proxy correctly', async function () {
    const {deployer} = fixture;
    const {usdcBank, usdcAaveV2Strategy} = deployer;

    const {aaveUsdcToken, aave, aaveStakedToken, aaveLendingPool, aaveIncentivesController} =
      await getNamedAccounts();
    const bank = await usdcAaveV2Strategy.bank();
    const underlying = await usdcAaveV2Strategy.underlying();
    const derivative = await usdcAaveV2Strategy.derivative();
    const reward = await usdcAaveV2Strategy.reward();
    const stakedToken = await usdcAaveV2Strategy.stakedToken();
    const lendingPool = await usdcAaveV2Strategy.lendingPool();
    const incentivesController = await usdcAaveV2Strategy.incentivesController();

    expect(bank).eq(usdcBank.address);
    expect(underlying).eq(usdc.address);
    expect(derivative).eq(aaveUsdcToken);
    expect(reward).eq(aave);
    expect(stakedToken).eq(aaveStakedToken);
    expect(lendingPool).eq(aaveLendingPool);
    expect(incentivesController).eq(aaveIncentivesController);
  });

  it('finances and deposits into AaveV2', async function () {
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

  it('waits until initial cooldown has passed to claim rewards', async function () {
    const {worker} = fixture;
    const {manager, usdcBank, usdcAaveV2Strategy} = worker;

    // wait 1 day, within initial claim delay
    await advanceNSeconds(ONE_DAY);
    await advanceNBlocks(1);

    // invest to show staked are not claimed yet
    await manager.finance(usdcBank.address);

    const stakedBalance = await usdcAaveV2Strategy.stakedBalance();
    const strategyBalance = await usdcBank.strategyBalance(0);
    console.log('Strategy Balance: ' + formatUnits(strategyBalance.toString(), 6));

    expect(stakedBalance).to.be.eq(0);
    expect(strategyBalance).to.be.gt(0);
  });

  it('claims first batch of rewards and starts unstake cooldown', async function () {
    const {worker} = fixture;
    const {manager, usdcBank, usdcAaveV2Strategy} = worker;

    // wait 10 days to pass the initial cooldown
    await advanceNSeconds(TEN_DAYS);
    await advanceNBlocks(1);

    // finance to claim first batch of rewards
    await manager.finance(usdcBank.address);

    const timestamp = (await getLatestBlock()).timestamp;
    const rewardCooldown = await usdcAaveV2Strategy.rewardCooldown();
    const stakedBalance = await usdcAaveV2Strategy.stakedBalance();
    const strategyBalance = await usdcBank.strategyBalance(0);
    console.log('Strategy Balance: ' + formatUnits(strategyBalance.toString(), 6));

    // ensure claimed stkAAVE and cooldown was set
    expect(rewardCooldown).to.be.gt(timestamp + NINE_DAYS);
    expect(stakedBalance).to.be.gt(0);
    expect(strategyBalance).to.be.gt(0);
  });

  it('unstakes and liquidates rewards after cooldown has passed', async () => {
    const {worker} = fixture;
    const {manager, usdcBank, usdcAaveV2Strategy} = worker;

    // wait 10 days to pass the unstaking cooldown
    await advanceNSeconds(TEN_DAYS);
    await advanceNBlocks(1);

    // finance to unstake stkAAVE to AAVE and trigger liquidation
    const investedBefore = await usdcAaveV2Strategy.investedBalance();
    const balanceBefore = await usdc.balanceOf(worker.address);

    await manager.finance(usdcBank.address);

    const timestamp = (await getLatestBlock()).timestamp;
    const rewardCooldown = await usdcAaveV2Strategy.rewardCooldown();
    const stakedBalance = await usdcAaveV2Strategy.stakedBalance();

    const investedAfter = await usdcAaveV2Strategy.investedBalance();
    console.log('Compounded AAVE for', formatUnits(investedAfter.sub(investedBefore), 6), 'USDC');

    const buybackBalance = await usdc.balanceOf(manager.address);
    console.log(
      'Manager received',
      formatUnits(buybackBalance, 6),
      'USDC for performing token buybacks'
    );

    const balanceAfter = await usdc.balanceOf(worker.address);
    console.log(
      'Worker received',
      formatUnits(balanceAfter.sub(balanceBefore), 6),
      'USDC for performing liquidation'
    );

    const strategyBalance = await usdcBank.strategyBalance(0);
    console.log('Strategy Balance: ' + formatUnits(strategyBalance.toString(), 6));

    // expect liquidation was profitable and fees were paid out
    expect(investedAfter).to.be.gt(investedBefore);
    expect(balanceAfter).to.be.gt(balanceBefore);
    expect(buybackBalance).to.be.gt(0);

    // verify we claimed more stkAAVE and reset the cooldown
    expect(rewardCooldown).to.be.gt(timestamp + NINE_DAYS);
    expect(stakedBalance).to.be.gt(0);
    expect(strategyBalance).to.be.gt(0);
  });

  it('claims more rewards and resets if cooldown has expired', async () => {
    const {worker} = fixture;
    const {manager, usdcBank, usdcAaveV2Strategy} = worker;

    // wait 15 days to pass the expiration
    await advanceNSeconds(FIFTEEN_DAYS);
    await advanceNBlocks(1);

    // finance to pass unstake and reset cooldown
    const stakedBefore = await usdcAaveV2Strategy.stakedBalance();

    await manager.finance(usdcBank.address);

    const timestamp = (await getLatestBlock()).timestamp;
    const rewardCooldown = await usdcAaveV2Strategy.rewardCooldown();
    const stakedAfter = await usdcAaveV2Strategy.stakedBalance();

    const strategyBalance = await usdcBank.strategyBalance(0);
    console.log('Strategy Balance: ' + formatUnits(strategyBalance.toString(), 6));

    // expect staked balance increased, cooldown was reset
    expect(stakedAfter).to.be.gt(stakedBefore);

    // verify we claimed more stkAAVE and reset the cooldown
    expect(rewardCooldown).to.be.gt(timestamp + NINE_DAYS);
    expect(strategyBalance).to.be.gt(0);
  });

  it('exits all and is profitable', async () => {
    const {worker, deployer} = fixture;
    const {manager} = deployer;
    const {usdcBank, usdcAaveV2Strategy} = worker;

    // Withdraw all from the strategy to the bank
    await manager.exit(usdcBank.address, usdcAaveV2Strategy.address);

    // Check that underlying balance for the user is now greater than when the test started
    const virtualBalance = await usdcBank.virtualBalance();
    const virtualPrice = await usdcBank.virtualPrice();

    console.log('Virtual Balance:', formatUnits(virtualBalance.toString(), 6));
    console.log('Virtual Price:', formatUnits(virtualPrice.toString(), 6));

    const shares = await usdcBank.balanceOf(worker.address);
    await usdcBank.withdraw(shares.toString());

    const workerEndingBalance = await usdc.balanceOf(worker.address);
    expect(startingBalance).to.be.lt(workerEndingBalance);

    console.log('Ending Balance: ' + formatUnits(workerEndingBalance.toString(), 6));
  });
});
