import {expect} from 'chai';
import {BankFixture, setupBankTest} from 'fixture';
import {getNamedAccounts} from 'hardhat';
import {getErc20At} from 'lib';
import {ERC20} from 'types';

describe('CompoundStrategy', async () => {
  let fixture: BankFixture;
  let usdc: ERC20;

  before(async () => {
    fixture = await setupBankTest();
    const {deployer, worker} = fixture;
    const {manager, usdcBank, usdcCompStrategy} = deployer;

    const addresses = await getNamedAccounts();
    usdc = await getErc20At(addresses.usdc, worker.address);

    await manager.setBank(usdcBank.address, true);
    await manager.addStrategy(usdcBank.address, usdcCompStrategy.address);
  });

  it('deployed and initialized Compound USDC Strategy proxy correctly', async () => {
    const {deployer} = fixture;
    const {usdcBank, usdcCompStrategy} = deployer;

    const {compUsdcToken, comp, compComptroller} = await getNamedAccounts();
    const bank = await usdcCompStrategy.bank();
    const underlying = await usdcCompStrategy.underlying();
    const derivative = await usdcCompStrategy.derivative();
    const reward = await usdcCompStrategy.reward();
    const comptroller = await usdcCompStrategy.comptroller();

    expect(bank).eq(usdcBank.address);
    expect(underlying).eq(usdc.address);
    expect(derivative).eq(compUsdcToken);
    expect(reward).eq(comp);
    expect(comptroller).eq(compComptroller);
  });
});
