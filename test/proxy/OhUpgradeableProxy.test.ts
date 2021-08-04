import {expect} from 'chai';
import {BankFixture, setupBankTest} from 'fixture';

describe('OhUpgradeableProxy', () => {
  let fixture: BankFixture;

  before(async () => {
    fixture = await setupBankTest();
  });

  it('is deployed correctly', async () => {
    const {deployer} = fixture;
    const {bankProxy, bankLogic, proxyAdmin} = deployer;

    const admin = await bankProxy.getAdmin();
    const implementation = await bankProxy.getImplementation();
    const version = await bankProxy.getVersion();

    expect(admin).eq(proxyAdmin.address);
    expect(implementation).eq(bankLogic.address);
    expect(version.toNumber()).eq(1);
  });
});
