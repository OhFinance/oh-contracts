import {parseEther} from '@ethersproject/units';
import {expect} from 'chai';
import {BankFixture, ManagementFixture, setupManagementTest, setupUsdcBankTest} from 'fixture';
import {getNamedAccounts} from 'hardhat';
import {addLiquidityEth, getERC20Contract, swapEthForTokens} from 'lib';
import {ERC20} from 'types';
import {advanceNBlocks, advanceNSeconds, TWO_DAYS} from 'utils';

describe('OhManager', () => {
  describe('deployment', () => {
    let fixture: ManagementFixture;

    before(async () => {
      fixture = await setupManagementTest();
    });

    it('is deployed correctly', async () => {
      const {deployer} = fixture;
      const {manager, token, registry} = deployer;

      const registryAddress = await manager.registry();
      const tokenAddress = await manager.token();
      const buybackFee = await manager.buybackFee();
      const managementFee = await manager.managementFee();

      expect(registryAddress).eq(registry.address);
      expect(tokenAddress).eq(token.address);
      expect(buybackFee).to.be.eq(200);
      expect(managementFee).to.be.eq(20);
    });
  });

  describe('functions', () => {
    let fixture: BankFixture;
    let usdc: ERC20;

    beforeEach(async () => {
      fixture = await setupUsdcBankTest();
      const {deployer, worker} = fixture;
      const {token, liquidator, manager} = deployer;
      const {bank} = worker;

      const addresses = await getNamedAccounts();
      usdc = await getERC20Contract(worker.address, addresses.usdc);

      // Buy USDC using the worker wallet
      await swapEthForTokens(worker.address, addresses.usdc, parseEther('200'));

      // approve and deposit balance of usdc into bank
      const balance = await usdc.balanceOf(worker.address);
      await usdc.approve(bank.address, balance);
      await bank.deposit(balance);

      // add liquidity to uniswap
      await token.approve(addresses.sushiswapV2, parseEther('1000000'));
      await addLiquidityEth(
        deployer.address,
        token.address,
        parseEther('1000000'),
        parseEther('100')
      );
    });

    it('finances a single strategy, then rebalances to all strategies', async () => {
      const {worker} = fixture;
      const {manager, bank} = worker;

      await manager.finance(bank.address);

      const invested = await bank.strategyBalance(0);
      expect(invested).to.be.gt(0);

      await manager.rebalance(bank.address);

      const invested0 = await bank.strategyBalance(0);
      const invested1 = await bank.strategyBalance(1);
      const invested2 = await bank.strategyBalance(2);

      expect(invested0).to.be.gt(0);
      expect(invested1).to.be.gt(0);
      expect(invested2).to.be.gt(0);
    });

    it('finances all strategies', async () => {
      const {worker} = fixture;
      const {manager, bank} = worker;

      await manager.financeAll(bank.address);

      const invested0 = await bank.strategyBalance(0);
      const invested1 = await bank.strategyBalance(1);
      const invested2 = await bank.strategyBalance(2);

      expect(invested0).to.be.gt(0);
      expect(invested1).to.be.gt(0);
      expect(invested2).to.be.gt(0);
    });

    it('accrues revenue when realizing profit and performs buybacks', async () => {
      const {deployer, worker} = fixture;
      const {token} = deployer;
      const {manager, bank} = worker;

      await manager.financeAll(bank.address);

      // advance time and blocks to accrue rewards on all strategies
      await advanceNSeconds(TWO_DAYS);
      await advanceNBlocks(1000);

      // record balance and finance to accrue revenue
      const buybackBefore = await usdc.balanceOf(manager.address);
      const balanceBefore = await usdc.balanceOf(worker.address);

      await manager.financeAll(bank.address);

      const buybackAfter = await usdc.balanceOf(manager.address);
      const balanceAfter = await usdc.balanceOf(worker.address);

      expect(buybackAfter).to.be.gt(buybackBefore);
      expect(balanceAfter).to.be.gt(balanceBefore);

      // log supply and perform buyback
      const supplyBefore = await token.totalSupply();

      await manager.buyback(usdc.address);

      const supplyAfter = await token.totalSupply();

      expect(supplyAfter).to.be.lt(supplyBefore);
    });
  });
});
