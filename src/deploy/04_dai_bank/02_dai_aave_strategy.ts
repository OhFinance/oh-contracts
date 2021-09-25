import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeAaveV2StrategyData} from 'lib';

// deploy the Oh! DAI Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts, network, run} = hre;
  const {deployer, dai, aaveDaiToken} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('12 - Oh! DAI AaveV2 Strategy');

  const registry = await ethers.getContract('OhRegistry');
  const ohDaiBank = await ethers.getContract('OhDaiBank');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const aaveV2Logic = await ethers.getContract('OhAaveV2Strategy');

  // build the data's for the strategies
  const data = await getInitializeAaveV2StrategyData(
    registry.address,
    ohDaiBank.address,
    dai,
    aaveDaiToken
  );
  const constructorArgs = [aaveV2Logic.address, proxyAdmin.address, data];

  const result = await deploy('OhDaiAaveV2Strategy', {
    from: deployer,
    contract: 'OhUpgradeableProxy',
    args: constructorArgs,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
  });
};

deploy.tags = ['OhDaiAaveV2Strategy'];
deploy.dependencies = ['OhRegistry', 'OhProxyAdmin', 'OhStrategy', 'OhDaiBank'];
export default deploy;
