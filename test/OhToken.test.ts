import {expect} from 'chai';
import {ethers} from 'hardhat';
import {getDelegationMessageData, getPermitMessageData} from 'lib';
import {execute, getDecimalNumber, signMessageData} from 'utils';
import {CoreFixture, coreFixture} from 'fixture';

describe('OhToken', () => {
  let fixture: CoreFixture;

  before(async () => {
    // run one time so we can test that nonces increments for both permit and delegate
    fixture = await coreFixture();
  });

  it('is deployed correctly', async () => {
    const {token, registry, deployer} = fixture;

    const registryAddress = await token.registry();
    const name = await token.name();
    const symbol = await token.symbol();
    const minted = await token.balanceOf(deployer.address);

    expect(registryAddress).eq(registry.address);
    expect(name).eq('Oh! Finance');
    expect(symbol).eq('OH');
    expect(minted.toString()).eq(getDecimalNumber(100000000).toString());
  });

  it('permits transfers with signature', async () => {
    const {token, deployer, worker} = fixture;
    const value = getDecimalNumber(100);

    const {message, data} = getPermitMessageData(
      'Oh! Finance',
      '1',
      token.address,
      deployer.address,
      worker.address,
      value.toString(),
      0, // nonce 0
      Date.now() + 1000
    );

    const {v, r, s} = await signMessageData(deployer.address, data);

    const workerToken = token.connect(worker);
    await workerToken.permit(deployer.address, worker.address, message.value, message.deadline, v, r, s);
    await workerToken.transferFrom(deployer.address, worker.address, message.value);

    const balance = await token.balanceOf(worker.address);
    const allowance = await token.allowance(deployer.address, worker.address);
    const permitNonce = await token.nonces(deployer.address);

    expect(balance.toString()).eq(value.toString());
    expect(allowance.toNumber()).eq(0);
    expect(permitNonce.toNumber()).eq(1);
  });

  it('delegates votes for user with signature', async () => {
    const {token, deployer, worker} = fixture;

    // delegate to self to create a checkpoint
    await token.delegate(deployer.address);
    const currentVotes = await token.getCurrentVotes(deployer.address);

    // use nonce = 1 to show increments on both
    const {message, data} = getDelegationMessageData(token.address, deployer.address, worker.address, 1, Date.now() + 1000);

    const {v, r, s} = await signMessageData(deployer.address, data);

    const workerToken = token.connect(worker);
    await workerToken.delegateBySig(deployer.address, worker.address, message.deadline, v, r, s);

    const delegatedVotes = await token.getCurrentVotes(worker.address);
    const newVotes = await token.getCurrentVotes(deployer.address);
    const delegationNonce = await token.nonces(deployer.address);

    expect(delegatedVotes.toString()).eq(currentVotes.toString());
    expect(newVotes.toNumber()).eq(0);
    expect(delegationNonce.toNumber()).eq(2);
  });
});
