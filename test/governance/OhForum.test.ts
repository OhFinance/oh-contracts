import {expect} from 'chai';
import {BankFixture, GovernanceFixture, setupGovernanceTest, setupVotingTest} from 'fixture';
import {parseEther} from '@ethersproject/units';
import {advanceNBlocks, advanceNSeconds, getCallData, getLatestBlock, THREE_DAYS} from 'utils';
import {getNamedAccounts} from 'hardhat';

describe('OhForum', () => {
  describe('deployment', () => {
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
      // expect(votingPeriod).to.be.eq(17280);
      expect(proposalThreshold).to.be.eq(parseEther('1000000'));
    });
  });

  describe('post-governance', () => {
    let fixture: BankFixture;

    before(async () => {
      fixture = await setupVotingTest();
      const {deployer} = fixture;
      const {token} = deployer;

      // self-delegate to meet proposal threshold
      await token.delegate(deployer.address);
    });

    it('accepts proposal to add bank', async () => {
      const {deployer} = fixture;
      const {forum, manager, usdcBank} = deployer;
      const setBankData = getCallData(['address', 'bool'], [usdcBank.address, true]);

      // propose to add the usdc bank
      await forum.propose(
        [manager.address],
        [0],
        ['setBank(address,bool)'],
        [setBankData],
        'Add Bank Test'
      );

      // expect the proposals to have been created
      const proposal = await forum.proposals(1);
      expect(proposal.proposer).eq(deployer.address);

      // advance to activate, then vote to pass and advance
      await advanceNBlocks(1);
      await forum.castVote(1, true);
      await advanceNBlocks(200);

      // queue and wait
      await forum.queue(1);
      await advanceNSeconds(THREE_DAYS);
      await advanceNBlocks(1);

      // execute and assert
      await forum.execute(1);
      const approved = await manager.banks(usdcBank.address);
      expect(approved).to.be.true;
    });

    it('accepts proposal to add strategy and set liquidator', async () => {
      const {deployer} = fixture;
      const {forum, manager, liquidator, token, usdcBank, aaveV2Strategy} = deployer;
      const {aave, weth, usdc} = await getNamedAccounts();

      const addStrategyData = getCallData(
        ['address', 'address'],
        [usdcBank.address, aaveV2Strategy.address]
      );
      const aaveRoutesData = getCallData(
        ['address', 'address', 'address[]'],
        [aave, usdc, [aave, weth, usdc]]
      );
      const buybackRoutesData = getCallData(
        ['address', 'address', 'address[]'],
        [usdc, token.address, [usdc, weth, token.address]]
      );
      const aaveLiquidatorData = getCallData(
        ['address', 'address', 'address'],
        [liquidator.address, aave, usdc]
      );
      const buybackLiquidatorData = getCallData(
        ['address', 'address', 'address'],
        [liquidator.address, usdc, token.address]
      );

      // propose to add the usdc bank
      await forum.propose(
        [manager.address, liquidator.address, liquidator.address, manager.address, manager.address],
        [0, 0, 0, 0, 0],
        [
          'addStrategy(address,address)',
          'setSushiswapRoutes(address,address,address[])',
          'setSushiswapRoutes(address,address,address[])',
          'setLiquidator(address,address,address)',
          'setLiquidator(address,address,address)',
        ],
        [
          addStrategyData,
          aaveRoutesData,
          buybackRoutesData,
          aaveLiquidatorData,
          buybackLiquidatorData,
        ],
        'Add Strategy and Liquidation Path Test'
      );

      // expect the proposals to have been created
      const proposal = await forum.proposals(2);
      expect(proposal.proposer).eq(deployer.address);

      // advance to activate, then vote to pass and advance
      await advanceNBlocks(1);
      await forum.castVote(2, true);
      await advanceNBlocks(200);

      // queue and wait
      await forum.queue(2);
      await advanceNSeconds(THREE_DAYS);
      await advanceNBlocks(1);

      // execute and assert
      await forum.execute(2);
      const strategy = await manager.strategies(usdcBank.address, 0);
      expect(strategy).eq(aaveV2Strategy.address);
    });

    it('rejects proposal to change params due to quorum');
  });
});
