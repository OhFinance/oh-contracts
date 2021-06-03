import {expect} from 'chai';
import {BankFixture, setupBankTest} from 'fixture';
import {getNamedAccounts} from 'hardhat';
import {getErc20At} from 'lib';
import {ERC20} from 'types';

describe('Curve3PoolStrategy', () => {
  let fixture: BankFixture;
  let usdc: ERC20;

  before(async () => {
    fixture = await setupBankTest();
    const {deployer, worker} = fixture;
    const {manager, usdcBank, usdcCrv3PoolStrategy} = deployer;

    const addresses = await getNamedAccounts();
    usdc = await getErc20At(addresses.usdc, worker.address);

    await manager.setBank(usdcBank.address, true);
    await manager.addStrategy(usdcBank.address, usdcCrv3PoolStrategy.address);
  });

  it('deployed and initialized Curve 3Pool USDC Strategy proxy correctly', async () => {
    const {deployer} = fixture;
    const {usdcBank, usdcCrv3PoolStrategy} = deployer;

    const {crv, crv3Token, crv3Pool, crv3Gauge, crvMintr} = await getNamedAccounts();
    const bank = await usdcCrv3PoolStrategy.bank();
    const underlying = await usdcCrv3PoolStrategy.underlying();
    const derivative = await usdcCrv3PoolStrategy.derivative();
    const reward = await usdcCrv3PoolStrategy.reward();
    const pool = await usdcCrv3PoolStrategy.pool();
    const gauge = await usdcCrv3PoolStrategy.gauge();
    const mintr = await usdcCrv3PoolStrategy.mintr();
    const index = await usdcCrv3PoolStrategy.index();

    expect(bank).eq(usdcBank.address);
    expect(underlying).eq(usdc.address);
    expect(derivative).eq(crv3Token);
    expect(reward).eq(crv);
    expect(pool).eq(crv3Pool);
    expect(gauge).eq(crv3Gauge);
    expect(mintr).eq(crvMintr);
    expect(index).to.be.eq(1);
  });
});
