import {expect} from 'chai';
import {addresses} from 'utils';
import {CoreFixture, coreFixture, governanceFixture, GovernanceFixture} from 'fixture';

describe('OhRegistry', () => {
  let fixture: CoreFixture;
  let govFixture: GovernanceFixture;

  before(async () => {
    fixture = await coreFixture();
    govFixture = await governanceFixture();
  });

  it('registry was deployed correctly in core phase', async () => {
    const {registry, deployer} = fixture;

    const governorAddress = await registry.governance();
    const managerAddress = await registry.manager();

    expect(governorAddress).eq(deployer.address);
    expect(managerAddress).eq(addresses.zero);
  });

  it('registry was configured correctly in governance phase', async () => {
    const {registry, governor, manager} = govFixture;

    await registry.setGovernance(governor.address);

    const governorAddress = await registry.governance();
    const managerAddress = await registry.manager();

    expect(governorAddress).eq(governor.address);
    expect(managerAddress).eq(manager.address);
  });
});
