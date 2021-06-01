import {TimelockFixture, timelockFixture} from 'fixture';
import {expect} from 'chai';
import {addresses, advanceNBlocks, advanceNSeconds, advanceToTimestamp} from 'utils';
import {assert} from 'console';
import {ethers} from 'hardhat';

describe('OhTimelock', () => {
  let fixture: TimelockFixture;

  before(async () => {
    fixture = await timelockFixture();
  });

  it('private timelock was deployed correctly', async () => {
    const {timelock} = fixture;

    const timestamp = (await fixture.deployer.provider!.getBlock('latest')).timestamp;
    const registry = await timelock.registry();
    const token = await timelock.token();
    const start = await timelock.timelockStart();
    const length = await timelock.timelockLength();

    expect(registry).eq(fixture.registry.address);
    expect(token).eq(fixture.token.address);
    expect(start.toNumber()).closeTo(timestamp + 2592000, 100); // test block timestamp + 1 month in seconds, 100s leeway
    expect(length.toNumber()).eq(20736000); // 8 months
  });

  it('foundation timelock was deployed correctly', async () => {
    const {foundation} = fixture;

    const timestamp = (await fixture.deployer.provider!.getBlock('latest')).timestamp;
    const registry = await foundation.registry();
    const token = await foundation.token();
    const start = await foundation.timelockStart();
    const length = await foundation.timelockLength();
    const amount = await foundation.balances(addresses.treasury);

    expect(registry).eq(fixture.registry.address);
    expect(token).eq(fixture.token.address);
    expect(start.toNumber()).closeTo(timestamp + 2592000, 100); // test block timestamp + 1 month in seconds, 100s leeway
    expect(length.toNumber()).eq(124416000); // 4 years
    expect(amount.toString()).eq(ethers.utils.parseEther('20000000').toString()); // 20m tokens
  });

  it('funds timelock was deployed correctly', async () => {
    const {funds} = fixture;

    const timestamp = (await fixture.deployer.provider!.getBlock('latest')).timestamp;
    const registry = await funds.registry();
    const token = await funds.token();
    const start = await funds.timelockStart();
    const length = await funds.timelockLength();
    const community = await funds.balances(addresses.community);
    const strategic = await funds.balances(addresses.strategic);

    expect(registry).eq(fixture.registry.address);
    expect(token).eq(fixture.token.address);
    expect(start.toNumber()).closeTo(timestamp + 2592000, 100); // test block timestamp + 1 month in seconds, 100s leeway
    expect(length.toNumber()).eq(31104000); // 1 year
    expect(community.toString()).eq(ethers.utils.parseEther('2500000').toString()); // 2.5m tokens
    expect(strategic.toString()).eq(ethers.utils.parseEther('4000000').toString()); // 4m tokens
  });

  it('legal timelock was deployed correctly', async () => {});

  it('allows users to claim tokens correctly', async () => {
    const {worker, timelock, token} = fixture;
    const vestAmount = ethers.utils.parseEther('100000'); // 100k

    // approve and add worker for 100k vest
    await token.approve(timelock.address, vestAmount);
    await timelock.add([worker.address], [vestAmount]);

    // check vest
    const total = await timelock.balances(worker.address);
    expect(total.toString()).eq(vestAmount.toString());

    // claiming before delay expires should revert
    await expect(timelock.connect(worker).claim()).to.be.revertedWith('Timelock: Lock not started');

    // advance to the beginning of the lock
    const start = await timelock.timelockStart();
    await advanceToTimestamp(start.toNumber());

    // advance through half the timelock
    await advanceNSeconds(20736000 / 2);
    await advanceNBlocks(1);

    // claim and calculate balances
    await timelock.connect(worker).claim();
    const claimed = await timelock.claimed(worker.address);
    const balance = await token.balanceOf(worker.address);

    // expect more than 50% claimed
    expect(claimed).to.be.eq(balance);
    expect(balance).to.be.gte(vestAmount.div(2));

    // advance past expiration
    await advanceNSeconds(20736000);
    await advanceNBlocks(1);

    await timelock.connect(worker).claim();
    const totalClaimed = await timelock.claimed(worker.address);
    const finalBalance = await token.balanceOf(worker.address);

    expect(totalClaimed).to.be.eq(finalBalance);
    expect(finalBalance).to.be.eq(vestAmount);
  });

  it('timelock gas usage test', async () => {});
});
