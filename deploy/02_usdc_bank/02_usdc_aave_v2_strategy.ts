import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeAaveV2StrategyData} from 'lib';

// deploy the Oh! USDC Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts, network, run} = hre;
  const {deployer, usdc, aaveUsdcToken} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('16 - Oh! USDC AaveV2 Strategy');

  const registry = await ethers.getContract('OhRegistry');
  const ohUsdcBank = await ethers.getContract('OhUsdcBank');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const aaveV2Logic = await ethers.getContract('OhAaveV2Strategy');

  // build the data's for the strategies
  const data = await getInitializeAaveV2StrategyData(
    registry.address,
    ohUsdcBank.address,
    usdc,
    aaveUsdcToken
  );
  const constructorArgs = [aaveV2Logic.address, proxyAdmin.address, data];

  const result = await deploy('OhUsdcAaveV2Strategy', {
    from: deployer,
    contract: 'OhUpgradeableProxy',
    args: constructorArgs,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
  });
};

deploy.skip = async (hre: HardhatRuntimeEnvironment) => {
  return hre.network.name === 'kovan' || hre.network.name === 'rinkeby';
};

deploy.tags = ['OhUsdcAaveV2Strategy'];
deploy.dependencies = ['OhRegistry', 'OhProxyAdmin', 'OhStrategy', 'OhUsdcBank'];
export default deploy;
