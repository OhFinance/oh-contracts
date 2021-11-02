import {getNamedAccounts} from 'hardhat';

import {
  getAaveV2StrategyContract,
  getCompoundStrategyContract,
  getCurve3PoolStrategyContract,
  getProxyAdminContract,
  getUsdcAaveV2StrategyProxyContract,
  getUsdcCompoundStrategyProxyContract,
  getUsdcCurve3PoolStrategyProxyContract,
} from 'utils';

async function run() {
  try {
    const {deployer} = await getNamedAccounts();

    const proxyAdmin = await getProxyAdminContract(deployer);
    const usdcAaveV2Proxy = await getUsdcAaveV2StrategyProxyContract(deployer);
    const usdcAaveV2Logic = await getAaveV2StrategyContract(deployer);
    const usdcCompoundProxy = await getUsdcCompoundStrategyProxyContract(deployer);
    const usdcCompoundLogic = await getCompoundStrategyContract(deployer);
    const usdcCurve3PoolProxy = await getUsdcCurve3PoolStrategyProxyContract(deployer);
    const usdcCurve3PoolLogic = await getCurve3PoolStrategyContract(deployer);

    await proxyAdmin.upgrade(usdcAaveV2Proxy.address, usdcAaveV2Logic.address);
    await proxyAdmin.upgrade(usdcCompoundProxy.address, usdcCompoundLogic.address);
    await proxyAdmin.upgrade(usdcCurve3PoolProxy.address, usdcCurve3PoolLogic.address);
  } catch (err) {
    console.error(err);
    return process.exit(1);
  }
}

run();
