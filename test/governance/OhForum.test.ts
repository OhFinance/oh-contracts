import {expect} from 'chai';
import {ethers} from 'hardhat';
import {getDecimalNumber} from 'utils';
import {governanceFixture, GovernanceFixture} from 'fixture';

describe('OhForum', () => {
  let fixture: GovernanceFixture;

  before(async () => {
    fixture = await governanceFixture();

    // await addBankAndStrategiesProposal(
    //   deployer,
    //   fixture.forum.address,
    //   fixture.manager.address,
    //   fixture.bankProxy.address,
    //   [
    //     fixture.aaveStrategyProxy.address,
    //     fixture.compStrategyProxy.address,
    //     fixture.crvStrategyProxy.address,
    //   ],
    //   'Add ohUSDC Bank and Strategies'
    // );
  });

  it('forum is deployed correctly', async () => {
    const {deployer, forum, token, registry} = fixture;

    const guardian = await forum.guardian();
    const tokenAddress = await forum.token();
    const registryAddress = await forum.registry();
    const votingDelay = await forum.votingDelay();
    const votingPeriod = await forum.votingPeriod();
    const proposalThreshold = await forum.proposalThreshold();

    expect(guardian).eq(deployer.address);
    expect(tokenAddress).eq(token.address);
    expect(registryAddress).eq(registry.address);
    expect(votingDelay.toNumber()).eq(1);
    expect(votingPeriod.toNumber()).eq(17280);
    expect(proposalThreshold.toString()).eq(
      getDecimalNumber(1000000).toString()
    );
  });
});
