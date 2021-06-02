import {expect} from 'chai';
import {getDelegationMessageData, getPermitMessageData} from 'lib';
import {signMessageData} from 'utils';
import {BaseFixture, setupTest} from 'fixture';
import {parseEther} from '@ethersproject/units';

describe('OhToken', () => {
  let fixture: BaseFixture;

  before(async () => {
    // run one time so we can test that nonces increments for both permit and delegate
    fixture = await setupTest();
  });

  it('is deployed correctly', async () => {
    const {deployer} = fixture;
    const {token, registry} = deployer;

    const registryAddress = await token.registry();
    const name = await token.name();
    const symbol = await token.symbol();
    const minted = await token.balanceOf(deployer.address);

    expect(registryAddress).eq(registry.address);
    expect(name).eq('Oh! Finance');
    expect(symbol).eq('OH');
    expect(minted).to.be.eq(parseEther('100000000'));
  });

  it('permits transfers with signature', async () => {
    const {deployer, worker} = fixture;
    const {token} = worker;

    // deploy signs message to permit worker to take 100 tokens
    const value = parseEther('100');
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

    // worker executes the permit and transfers from the deployer
    await token.permit(deployer.address, worker.address, message.value, message.deadline, v, r, s);
    await token.transferFrom(deployer.address, worker.address, message.value);

    const balance = await token.balanceOf(worker.address);
    const allowance = await token.allowance(deployer.address, worker.address);
    const permitNonce = await token.nonces(deployer.address);

    expect(balance).to.be.eq(value);
    expect(allowance).to.be.eq(0);
    expect(permitNonce).to.be.eq(1);
  });

  it('delegates votes for user with signature', async () => {
    const {deployer, worker} = fixture;
    const {token} = worker;

    // deployer delegates to self to create a checkpoint
    await deployer.token.delegate(deployer.address);
    const currentVotes = await token.getCurrentVotes(deployer.address);

    // use nonce = 1 to show increments on both, sign message to delegate votes to worker
    const {message, data} = getDelegationMessageData(token.address, deployer.address, worker.address, 1, Date.now() + 1000);
    const {v, r, s} = await signMessageData(deployer.address, data);

    // worker executes the function and accrues delegates
    await token.delegateBySig(deployer.address, worker.address, message.deadline, v, r, s);

    const delegatedVotes = await token.getCurrentVotes(worker.address);
    const newVotes = await token.getCurrentVotes(deployer.address);
    const delegationNonce = await token.nonces(deployer.address);

    expect(delegatedVotes).to.be.eq(currentVotes);
    expect(newVotes).to.be.eq(0);
    expect(delegationNonce).to.be.eq(2);
  });
});
