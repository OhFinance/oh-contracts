import {getNamedAccounts, network} from 'hardhat';
import {
  getManagerContract,
  getUdscBankContract,
  getUsdcAaveV2StrategyContract,
  getUsdcCompoundStrategyContract,
  getUsdcCurve3PoolStrategyContract,
} from 'utils';

async function run() {
  try {
    const {deployer} = await getNamedAccounts();

    const manager = await getManagerContract(deployer);
    const bank = await getUdscBankContract(deployer);

    await manager.setBank(bank.address, true);

    if (network.name === 'rinkeby' || network.name === 'kovan') {
      const compStrategy = await getUsdcCompoundStrategyContract(deployer);

      await manager.setStrategy(bank.address, compStrategy.address, true);
    } else if (network.name === 'mainnet') {
      const aaveV2Strategy = await getUsdcAaveV2StrategyContract(deployer);
      const compStrategy = await getUsdcCompoundStrategyContract(deployer);
      const crv3PoolStrategy = await getUsdcCurve3PoolStrategyContract(deployer);

      await manager.setStrategy(bank.address, aaveV2Strategy.address, true);
      await manager.setStrategy(bank.address, compStrategy.address, true);
      await manager.setStrategy(bank.address, crv3PoolStrategy.address, true);
    }
  } catch (err) {
    console.error(err);
    return process.exit(1);
  }
}

run();
