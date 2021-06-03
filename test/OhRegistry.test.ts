import {expect} from 'chai';
import {BaseFixture, ManagementFixture, setupManagementTest, setupTest} from 'fixture';
import {getNamedAccounts} from 'hardhat';

describe('OhRegistry', () => {
  describe('core phase', () => {
    let fixture: BaseFixture;

    before(async () => {
      fixture = await setupTest();
    });

    it('was deployed correctly', async () => {
      const {deployer} = fixture;
      const {registry} = deployer;

      const {zero} = await getNamedAccounts();
      const governorAddress = await registry.governance();
      const managerAddress = await registry.manager();

      expect(governorAddress).eq(deployer.address);
      expect(managerAddress).eq(zero);
    });
  });

  describe('management phase', () => {
    let fixture: ManagementFixture;

    before(async () => {
      fixture = await setupManagementTest();
      // managementFixture = await setupManagementTest();
    });

    it('set the manager correctly', async () => {
      const {deployer} = fixture;
      const {registry, manager} = deployer;

      const managerAddress = await registry.manager();

      expect(managerAddress).eq(manager.address);
    });
  });

  // it('was configured correctly in governance phase', async () => {
  //   const {registry, governor, manager} = govFixture;

  //   await registry.setGovernance(governor.address);

  //   const governorAddress = await registry.governance();
  //   const managerAddress = await registry.manager();

  //   expect(governorAddress).eq(governor.address);
  //   expect(managerAddress).eq(manager.address);
  // });
});
