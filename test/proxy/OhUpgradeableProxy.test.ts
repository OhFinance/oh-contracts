import {expect} from 'chai';
import {BankFixture, bankFixture} from 'fixture';

describe('OhUpgradeableProxy', () => {
  let fixture: BankFixture;

  before(async () => {
    fixture = await bankFixture();
  });

  it('proxyAdmin is deployed correctly', async () => {
    const {bankUpgradeableProxy, bankLogic, proxyAdmin} = fixture;
    
    const admin = await bankUpgradeableProxy.getAdmin();
    const implementation = await bankUpgradeableProxy.getImplementation();
    const version = await bankUpgradeableProxy.getVersion();

    expect(admin).eq(proxyAdmin.address);
    expect(implementation).eq(bankLogic.address);
    expect(version.toNumber()).eq(1);
  });

})