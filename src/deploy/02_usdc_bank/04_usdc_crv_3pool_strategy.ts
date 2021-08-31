import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeCurve3PoolStrategyData} from 'lib';

// deploy the Oh! USDC Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts, network, run} = hre;
  const {deployer, usdc} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('18 - Oh! USDC Curve 3Pool Strategy');

  const registry = await ethers.getContract('OhRegistry');
  const ohUsdcBank = await ethers.getContract('OhUsdcBank');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const crv3PoolLogic = await ethers.getContract('OhCurve3PoolStrategy');

  const data = await getInitializeCurve3PoolStrategyData(
    registry.address,
    ohUsdcBank.address,
    usdc,
    '1'
  );
  const constructorArgs = [crv3PoolLogic.address, proxyAdmin.address, data];

  const result = await deploy('OhUsdcCurve3PoolStrategy', {
    from: deployer,
    contract: 'OhUpgradeableProxy',
    args: constructorArgs,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
  });
};

deploy.tags = ['OhUsdcCurve3PoolStrategy'];
deploy.dependencies = ['OhRegistry', 'OhProxyAdmin', 'OhStrategy', 'OhUsdcBank'];
export default deploy;
