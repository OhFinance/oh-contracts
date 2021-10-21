import {ethers, getNamedAccounts, network} from 'hardhat';
import {
  getManagerContract,
  getTimelockContract,
  getTokenContract,
  getUdscBankContract,
  getUsdcAaveV2StrategyContract,
  getUsdcCompoundStrategyContract,
  getUsdcCurve3PoolStrategyContract,
} from 'utils';

const addUserMap = [
  []
]

async function run() {
  try {
    const {deployer} = await getNamedAccounts();

    const vested = await getTimelockContract('OhVestingTimelock', deployer)
    const growth = await getTimelockContract('OhGrowthTimelock', deployer)
    const foundation = await getTimelockContract('OhFoundationTimelock', deployer)
    const legal = await getTimelockContract('OhLegalTimelock', deployer)

    const token = await getTokenContract(deployer)


  } catch (err) {
    console.error(err);
    return process.exit(1);
  }
}

run();