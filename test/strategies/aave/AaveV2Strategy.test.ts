import {expect} from 'chai';
import {BankFixture, bankFixture} from 'fixture';
import {addresses, advanceNBlocks, advanceNSeconds, getDecimalString} from 'utils';
import {getErc20At, swapEthForTokens} from 'lib';
import {formatUnits} from '@ethersproject/units';
import {ethers} from 'hardhat';
import {ERC20, IStakedToken} from 'types';
import {BigNumber} from '@ethersproject/bignumber';

const ONE_DAY = 86400;
const TEN_DAYS = ONE_DAY * 10;
const FIFTEEN_DAYS = ONE_DAY * 15;

describe('AaveV2Strategy', () => {
  let fixture: BankFixture;
  let usdc: ERC20;
  let startingBalance: BigNumber;

  before(async () => {
    fixture = await bankFixture();
    const {manager, worker, bankProxy, aaveV2StrategyProxy} = fixture;

    usdc = await getErc20At(addresses.usdc, worker);

    await manager.setBank(bankProxy.address, true);
    await manager.addStrategy(bankProxy.address, aaveV2StrategyProxy.address);

    // Buy USDC using the worker wallet
    await swapEthForTokens(fixture.worker, addresses.usdc, getDecimalString(100));

    // Check USDC balance and approve spending
    startingBalance = await usdc.balanceOf(worker.address);
    console.log('Starting Balance:', formatUnits(startingBalance.toString(), 6));
    await usdc.approve(bankProxy.address, startingBalance);
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

  it('finances and deposits into AaveV2', async () => {
    const {bankProxy, worker, aaveV2StrategyProxy} = fixture;

    // Deposit the USDC in the Bank
    await bankProxy.connect(worker).deposit(startingBalance);
    const bankBalance = await bankProxy.underlyingBalance();

    // Check that tha Bank now has proper amount of USDC deposited
    expect(bankBalance).to.be.eq(startingBalance);

    // Invest the initial USDC into the strategy
    await financeWithLog();
    expect(await aaveV2StrategyProxy.investedBalance()).to.be.gt(0);
  });

  it('waits until initial cooldown has passed to claim rewards', async () => {
    const {aaveV2StrategyProxy} = fixture;

    // wait 1 day, within initial claim delay
    await advanceNSeconds(ONE_DAY);
    await advanceNBlocks(1);

    // invest to show staked are not claimed yet
    await financeWithLog();
    expect(await aaveV2StrategyProxy.stakedBalance()).to.be.eq(0);
  });

  it('claims first batch of rewards and starts unstake cooldown', async () => {
    const {aaveV2StrategyProxy} = fixture;

    // wait 10 days to pass the initial cooldown
    await advanceNSeconds(TEN_DAYS);
    await advanceNBlocks(1);

    // finance to claim first batch of rewards
    await financeWithLog();

    // ensure claimed stkAAVE and cooldown was set
    expect(await aaveV2StrategyProxy.stakedBalance()).to.be.gt(0);
    await verifyCooldown();
  });

  it('unstakes and liquidates rewards after cooldown has passed', async () => {
    const {aaveV2StrategyProxy} = fixture;

    // wait 10 days to pass the unstaking cooldown
    await advanceNSeconds(TEN_DAYS);
    await advanceNBlocks(1);

    // finance to unstake stkAAVE to AAVE and trigger liquidation
    const liquidated = await aaveV2StrategyProxy.stakedBalance();
    const balanceBefore = await aaveV2StrategyProxy.investedBalance();
    await financeWithLog();
    const balanceAfter = await aaveV2StrategyProxy.investedBalance();

    // expect liquidation was profitable
    expect(balanceAfter).to.be.gt(balanceBefore);
    console.log('Liquidated', formatUnits(liquidated), 'stkAAVE for', formatUnits(balanceAfter.sub(balanceBefore), 6), 'USDC');

    // verify we claimed more stkAAVE and reset the cooldown
    expect(await aaveV2StrategyProxy.stakedBalance()).to.be.gt(0);
    await verifyCooldown();
  });

  it('claims more rewards and resets if cooldown has expired', async () => {
    const {aaveV2StrategyProxy} = fixture;

    // wait 15 days to pass the expiration
    await advanceNSeconds(FIFTEEN_DAYS);
    await advanceNBlocks(1);

    // finance to pass unstake and reset cooldown
    const stakedBefore = await aaveV2StrategyProxy.stakedBalance();
    await financeWithLog();
    const stakedAfter = await aaveV2StrategyProxy.stakedBalance();

    // expect staked balance increased, cooldown was reset
    expect(stakedAfter).to.be.gt(stakedBefore);
    await verifyCooldown();
  });

  it('exits all and is profitable', async () => {
    const {bankProxy, manager, worker, aaveV2StrategyProxy} = fixture;

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
    expect(startingBalance).to.be.lt(workerEndingBalance);

    console.log('Ending Balance: ' + formatUnits(workerEndingBalance.toString(), 6));
  });

  // finance strategy and log balance
  const financeWithLog = async () => {
    const {bankProxy, manager} = fixture;

    await manager.finance(bankProxy.address);
    const strategyBalance = await bankProxy.strategyBalance(0);
    console.log('Strategy Balance: ' + formatUnits(strategyBalance.toString(), 6));
  };

  // verify unstake cooldown is set properly
  const verifyCooldown = async () => {
    const {aaveV2StrategyProxy, worker} = fixture;

    const contract = (await ethers.getContractAt('IStakedToken', addresses.aaveStakedToken, worker)) as IStakedToken;
    const cooldown = await contract.stakersCooldowns(aaveV2StrategyProxy.address);
    expect(await aaveV2StrategyProxy.rewardCooldown()).to.be.eq(cooldown.add(TEN_DAYS));
  };
});
