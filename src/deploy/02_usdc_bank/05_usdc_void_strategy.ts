import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeVoidStrategyData} from 'lib';

// deploy the Oh! USDC Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts, network, run} = hre;
  const {deployer} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('16 - Oh! USDC Void Strategy');

  const registry = await ethers.getContract('OhRegistry');
  const ohUsdcBank = await ethers.getContract('OhUsdcBank');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const voidLogic = await ethers.getContract('OhVoidStrategy');

  // build the data's for the strategies
  const data = await getInitializeVoidStrategyData(
    registry.address,
    ohUsdcBank.address,
  );
  const constructorArgs = [voidLogic.address, proxyAdmin.address, data];

  const result = await deploy('OhUsdcVoidStrategy', {
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

deploy.tags = ['OhUsdcVoidStrategy'];
deploy.dependencies = ['OhRegistry', 'OhProxyAdmin', 'OhUsdcBank'];
export default deploy;