import {expect} from 'chai';
import {GovernanceFixture, setupGovernanceTest} from 'fixture';

describe('OhGovernor', () => {
  let fixture: GovernanceFixture;

  before(async () => {
    fixture = await setupGovernanceTest();
  });

  it('is deployed correctly', async () => {
    const {deployer} = fixture;
    const {governor, forum} = deployer;

    const admin = await governor.admin();
    const delay = await governor.delay();

    expect(admin).eq(forum.address);
    expect(delay.toNumber()).to.eq(172800);
  });
});
