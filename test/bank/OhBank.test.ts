import {signMessageData} from 'utils';
import {BankFixture, setupUsdcBankTest} from 'fixture';
import {expect} from 'chai';
import {getERC20Contract, getPermitMessageData, swapEthForTokens} from 'lib';
import {ERC20} from 'types';
import {getNamedAccounts} from 'hardhat';
import {parseEther} from '@ethersproject/units';

describe('OhBank', () => {
  let fixture: BankFixture;
  let usdc: ERC20;

  before(async () => {
    const addresses = await getNamedAccounts();

    fixture = await setupUsdcBankTest();

    const {worker} = fixture;

    usdc = await getERC20Contract(worker.address, addresses.usdc);

    // buy usdc for worker to use in tests
    await swapEthForTokens(worker.address, addresses.usdc, parseEther('100'));
  });

  it('logic prevents initialization after deployment', async () => {
    const {worker} = fixture;
    const {bank, registry} = worker;

    // try to initialize the bank
    expect(bank.initializeBank('Test', 'TEST', registry.address, usdc.address)).to.be.reverted;
  });

  it('permits transfers with signature', async () => {
    const {deployer, worker} = fixture;
    const {bank} = worker;

    // connect to worker, deposit usdc to get shares
    const balance = await usdc.balanceOf(worker.address);
    await usdc.approve(bank.address, balance);

    await bank.deposit(balance);

    // get permit message data and sign with the worker
    const shares = await bank.balanceOf(worker.address);
    const {message, data} = getPermitMessageData(
      'Oh! USDC',
      '1',
      bank.address,
      worker.address,
      deployer.address,
      shares.toString(),
      0,
      Date.now() + 1000
    );
    const {v, r, s} = await signMessageData(worker.address, data);

    // use deployer and transfer from worker
    await deployer.bank.permit(
      worker.address,
      deployer.address,
      message.value,
      message.deadline,
      v,
      r,
      s
    );
    await deployer.bank.transferFrom(worker.address, deployer.address, message.value);

    const received = await bank.balanceOf(deployer.address);
    const allowance = await bank.allowance(worker.address, deployer.address);
    const nonces = await bank.nonces(worker.address);

    expect(received.toString()).eq(shares.toString());
    expect(allowance.toNumber()).eq(0);
    expect(nonces.toNumber()).eq(1);
  });
});
