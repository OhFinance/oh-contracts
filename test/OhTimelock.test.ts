import {expect} from 'chai';
import {addresses, deployContract, execute} from 'utils';
import {CoreFixture, coreFixture} from 'fixture';
import {deployTimelock} from 'lib';
import {OhTimelock} from 'types';

describe('OhRegistry', () => {
  let fixture: CoreFixture;
  let timelock: OhTimelock;

  before(async () => {
    fixture = await coreFixture();
    const {deployer, registry, token} = fixture;

    // timelock = await deployTimelock(deployer, registry.address, token.address, );
  });

  it('timelock was deployed correctly', async () => {});
});
