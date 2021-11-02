import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeCurve3PoolStrategyData} from 'lib';

// deploy the Oh! DAI Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts, network, run} = hre;
  const {deployer, dai} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('14 - Oh! DAI Curve 3Pool Strategy');

  const registry = await ethers.getContract('OhRegistry');
  const ohDaiBank = await ethers.getContract('OhDaiBank');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const crv3PoolLogic = await ethers.getContract('OhCurve3PoolStrategy');

  const data = await getInitializeCurve3PoolStrategyData(
    registry.address,
    ohDaiBank.address,
    dai,
    '0'
  );
  const constructorArgs = [crv3PoolLogic.address, proxyAdmin.address, data];

  const result = await deploy('OhDaiCurve3PoolStrategy', {
    from: deployer,
    contract: 'OhUpgradeableProxy',
    args: constructorArgs,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
  });
};

deploy.tags = ['OhDaiCurve3PoolStrategy'];
deploy.dependencies = ['OhRegistry', 'OhProxyAdmin', 'OhStrategy', 'OhDaiBank'];
export default deploy;
