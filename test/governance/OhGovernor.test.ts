import {expect} from 'chai';
import {ethers} from 'hardhat';
import {governanceFixture, GovernanceFixture} from 'fixture';

describe('OhGovernor', () => {
  let fixture: GovernanceFixture;

  before(async () => {
    const [deployer] = await ethers.getSigners();
    fixture = await governanceFixture();
  });

  it('governor is deployed correctly', async () => {
    const {governor, forum} = fixture;

    const admin = await governor.admin();
    const delay = await governor.delay();

    expect(admin).eq(forum.address);
    expect(delay.toNumber()).to.eq(172800);
  });
});
