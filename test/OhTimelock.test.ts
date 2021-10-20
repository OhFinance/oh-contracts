import {setupVestingTest, VestingFixture} from 'fixture';
import {expect} from 'chai';
import {advanceNBlocks, advanceNSeconds, advanceToTimestamp, getLatestBlock} from 'utils';
import {ethers, getNamedAccounts} from 'hardhat';

describe('OhTimelock', () => {
  let fixture: VestingFixture;

  before(async () => {
    fixture = await setupVestingTest();
  });

  it('vesting timelock was deployed correctly', async () => {
    const {deployer} = fixture;
    const {vesting, registry, token} = deployer;

    const timestamp = (await getLatestBlock()).timestamp;
    const registryAddress = await vesting.registry();
    const tokenAddress = await vesting.token();
    const start = await vesting.timelockStart();
    const length = await vesting.timelockLength();

    expect(registryAddress).eq(registry.address);
    expect(tokenAddress).eq(token.address);
    expect(start.toNumber()).closeTo(timestamp + 2592000, 100); // test block timestamp + 1 month in seconds, 100s leeway
    expect(length.toNumber()).eq(20736000); // 8 months
  });

  it('foundation timelock was deployed correctly', async () => {
    const {deployer} = fixture;
    const {foundation, registry, token} = deployer;

    const {treasury} = await getNamedAccounts();
    const timestamp = (await getLatestBlock()).timestamp;
    const registryAddress = await foundation.registry();
    const tokenAddress = await foundation.token();
    const start = await foundation.timelockStart();
    const length = await foundation.timelockLength();
    const amount = await foundation.balances(treasury);

    expect(registryAddress).eq(registry.address);
    expect(tokenAddress).eq(token.address);
    expect(start.toNumber()).closeTo(timestamp + 2592000, 100); // test block timestamp + 1 month in seconds, 100s leeway
    expect(length.toNumber()).eq(124416000); // 4 years
    // expect(amount.toString()).eq(ethers.utils.parseEther('20000000').toString()); // 20m tokens
  });

  it('growth timelock was deployed correctly', async () => {
    const {deployer} = fixture;
    const {growth, registry, token} = deployer;

    const {community, strategic} = await getNamedAccounts();
    const timestamp = (await getLatestBlock()).timestamp;
    const registryAddress = await growth.registry();
    const tokenAddress = await growth.token();
    const start = await growth.timelockStart();
    const length = await growth.timelockLength();
    // const communityAmount = await growth.balances(community);
    // const strategicAmount = await growth.balances(strategic);

    expect(registryAddress).eq(registry.address);
    expect(tokenAddress).eq(token.address);
    expect(start.toNumber()).closeTo(timestamp + 2592000, 100); // test block timestamp + 1 month in seconds, 100s leeway
    expect(length.toNumber()).eq(31104000); // 1 year
    // expect(community.toString()).eq(ethers.utils.parseEther('2500000').toString()); // 2.5m tokens
    // expect(strategic.toString()).eq(ethers.utils.parseEther('4000000').toString()); // 4m tokens
  });

  it('legal timelock was deployed correctly', async () => {
    const {deployer} = fixture;
    const {legal, registry, token} = deployer;

    const timestamp = (await getLatestBlock()).timestamp;
    const registryAddress = await legal.registry();
    const tokenAddress = await legal.token();
    const start = await legal.timelockStart();
    const length = await legal.timelockLength();

    expect(registryAddress).eq(registry.address);
    expect(tokenAddress).eq(token.address);
    expect(start.toNumber()).closeTo(timestamp + 2592000, 100); // test block timestamp + 1 month in seconds, 100s leeway
    expect(length.toNumber()).eq(12960000); // 5 months
  });

  it('allows users to claim tokens correctly', async () => {
    const {deployer, worker} = fixture;
    const {token} = deployer;
    const {vesting} = worker;

    const vestAmount = ethers.utils.parseEther('100000'); // 100k

    // approve and add worker for 100k vest
    await token.approve(vesting.address, vestAmount);
    await deployer.vesting.add([worker.address], [vestAmount]);

    // check vest
    const total = await vesting.balances(worker.address);
    expect(total.toString()).eq(vestAmount.toString());

    // claiming before delay expires should revert
    await expect(vesting.claim()).to.be.revertedWith('Timelock: Lock not started');

    // advance to the beginning of the lock
    const start = await vesting.timelockStart();
    await advanceToTimestamp(start.toNumber());

    // advance through half the timelock
    await advanceNSeconds(20736000 / 2);
    await advanceNBlocks(1);

    // claim and calculate balances
    await vesting.claim();
    const claimed = await vesting.claimed(worker.address);
    const balance = await token.balanceOf(worker.address);

    // expect more than 50% claimed
    expect(claimed).to.be.eq(balance);
    expect(balance).to.be.gte(vestAmount.div(2));

    // advance past expiration
    await advanceNSeconds(20736000);
    await advanceNBlocks(1);

    await vesting.claim();
    const totalClaimed = await vesting.claimed(worker.address);
    const finalBalance = await token.balanceOf(worker.address);

    expect(totalClaimed).to.be.eq(finalBalance);
    expect(finalBalance).to.be.eq(vestAmount);

    await expect(vesting.claim()).to.be.revertedWith('Timelock: No Tokens');
  });

  it('gas usage test', async () => {
    const {deployer} = fixture;
    const {token, vesting} = deployer;

    const signers = await ethers.getSigners();
    const recipients = signers.map((signer) => signer.address);

    await token.approve(vesting.address, ethers.constants.MaxUint256);
    await vesting.add(recipients, Array(20).fill(ethers.utils.parseEther('100000')));
  });
});
