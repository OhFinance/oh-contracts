import {
  addresses,
  execute,
  getDecimalNumber,
  getDecimalString,
  signMessageData,
} from 'utils';
import {BankFixture, bankFixture, ohUsdcFixture, OhUsdcFixture} from 'fixture';
import {expect} from 'chai';
import {getErc20At, getPermitMessageData, swapEthForTokens} from 'lib';
import {ERC20} from 'types';

describe('OhBank', () => {
  let fixture: BankFixture;
  let usdcFixture: OhUsdcFixture;
  let usdc: ERC20;

  before(async () => {
    fixture = await bankFixture();
    usdcFixture = await ohUsdcFixture();
    usdc = await getErc20At(addresses.usdc, usdcFixture.worker);

    // buy usdc for worker to use in tests
    await swapEthForTokens(
      fixture.worker,
      addresses.usdc,
      getDecimalString(100)
    );
  });

  it('logic prevents initialization after deployment', async () => {
    const {bankLogic, worker, registry} = fixture;
    const bankLogicWorker = bankLogic.connect(worker);

    expect(
      bankLogicWorker.initializeBank(
        'Test',
        'TEST',
        registry.address,
        addresses.usdc
      )
    ).to.be.reverted;
  });

  it('permits transfers with signature', async () => {
    let {bankProxy, deployer, worker} = usdcFixture;

    // connect to worker, deposit usdc to get shares
    const bankProxyWorker = bankProxy.connect(worker);
    const balance = await usdc.balanceOf(worker.address);
    await execute(usdc.approve(bankProxyWorker.address, balance));
    await execute(bankProxyWorker.deposit(balance));

    // get permit message data and sign with the worker
    const shares = await bankProxy.balanceOf(worker.address);
    const {message, data} = getPermitMessageData(
      'Oh! USDC',
      '1',
      bankProxy.address,
      worker.address,
      deployer.address,
      shares.toString(),
      0,
      Date.now() + 1000
    );
    const {v, r, s} = await signMessageData(worker.address, data);

    // transfer away from worker
    await execute(
      bankProxy.permit(
        worker.address,
        deployer.address,
        message.value,
        message.deadline,
        v,
        r,
        s
      )
    );
    await execute(
      bankProxy.transferFrom(worker.address, deployer.address, message.value)
    );

    const received = await bankProxy.balanceOf(deployer.address);
    const allowance = await bankProxy.allowance(
      worker.address,
      deployer.address
    );
    const nonces = await bankProxy.nonces(worker.address);

    expect(received.toString()).eq(shares.toString());
    expect(allowance.toNumber()).eq(0);
    expect(nonces.toNumber()).eq(1);
  });
});
