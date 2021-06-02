import {expect} from 'chai';
import {addresses} from 'utils';
import {BaseFixture, ManagementFixture, setupManagementTest, setupTest} from 'fixture';

describe('OhRegistry', () => {
  let fixture: BaseFixture;
  let managementFixture: ManagementFixture;

  before(async () => {
    fixture = await setupTest();
    managementFixture = await setupManagementTest();
  });

  it('was deployed correctly in core phase', async () => {
    const {deployer} = fixture;
    const {registry} = deployer;

    const governorAddress = await registry.governance();
    const managerAddress = await registry.manager();

    expect(governorAddress).eq(deployer.address);
    expect(managerAddress).eq(addresses.zero);
  });

  it('set the manager correctly during deployment', async () => {
    const {deployer} = managementFixture;
    const {registry, manager} = deployer;

    const managerAddress = await registry.manager();

    expect(managerAddress).eq(manager.address);
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
