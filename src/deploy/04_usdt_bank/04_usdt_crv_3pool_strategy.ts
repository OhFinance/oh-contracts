import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeCurve3PoolStrategyData} from 'lib';

// deploy the Oh! USDT Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts, network, run} = hre;
  const {deployer, usdt} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('22 - Oh! USDT Curve 3Pool Strategy');

  const registry = await ethers.getContract('OhRegistry');
  const ohUsdtBank = await ethers.getContract('OhUsdtBank');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const crv3PoolLogic = await ethers.getContract('OhCurve3PoolStrategy');

  const data = await getInitializeCurve3PoolStrategyData(registry.address, ohUsdtBank.address, usdt, '2');
  const constructorArgs = [crv3PoolLogic.address, proxyAdmin.address, data];

  const result = await deploy('OhUsdtCurve3PoolStrategy', {
    from: deployer,
    contract: 'OhUpgradeableProxy',
    args: constructorArgs,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
  });

  // verify the contract
  if (result.newlyDeployed && network.live) {
    await run('verify:verify', {
      address: result.address,
      constructorArgs,
    });
  }
};

deploy.tags = ['OhUsdtCurve3PoolStrategy'];
deploy.dependencies = ['OhRegistry', 'OhProxyAdmin', 'OhStrategy', 'OhUsdtBank'];
export default deploy;
