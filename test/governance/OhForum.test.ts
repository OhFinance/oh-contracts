import {expect} from 'chai';
import {GovernanceFixture, setupGovernanceTest} from 'fixture';
import {parseEther} from '@ethersproject/units';

describe('OhForum', () => {
  let fixture: GovernanceFixture;

  before(async () => {
    fixture = await setupGovernanceTest();
  });

  it('forum is deployed correctly', async () => {
    const {deployer} = fixture;
    const {forum, token, registry} = deployer;

    const guardian = await forum.guardian();
    const tokenAddress = await forum.token();
    const registryAddress = await forum.registry();
    const votingDelay = await forum.votingDelay();
    const votingPeriod = await forum.votingPeriod();
    const proposalThreshold = await forum.proposalThreshold();

    expect(guardian).eq(deployer.address);
    expect(tokenAddress).eq(token.address);
    expect(registryAddress).eq(registry.address);
    expect(votingDelay).to.be.eq(1);
    expect(votingPeriod).to.be.eq(17280);
    expect(proposalThreshold).to.be.eq(parseEther('1000000'));
  });
});
