import {expect} from 'chai';
import {ManagementFixture, setupManagementTest} from 'fixture';

describe('OhManager', () => {
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
