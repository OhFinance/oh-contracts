import {expect} from 'chai';
import {BankFixture, setupBankTest} from 'fixture';

describe('OhUpgradeableProxy', () => {
  let fixture: BankFixture;

  before(async () => {
    fixture = await setupBankTest();
  });

  it('is deployed correctly', async () => {
    const {deployer} = fixture;
    const {usdcBankProxy, bank, proxyAdmin} = deployer;

    const admin = await usdcBankProxy.getAdmin();
    const implementation = await usdcBankProxy.getImplementation();
    const version = await usdcBankProxy.getVersion();

    expect(admin).eq(proxyAdmin.address);
    expect(implementation).eq(bank.address);
    expect(version.toNumber()).eq(1);
  });
});
