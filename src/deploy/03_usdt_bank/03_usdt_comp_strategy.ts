import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeCompoundStrategyData} from 'lib';

// deploy the Oh! USDT Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts, network, run} = hre;
  const {deployer, usdt, compUsdtToken} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('21 - Oh! USDT Compound Strategy');

  const registry = await ethers.getContract('OhRegistry');
  const ohUsdtBank = await ethers.getContract('OhUsdtBank');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const compLogic = await ethers.getContract('OhCompoundStrategy');

  const data = await getInitializeCompoundStrategyData(
    registry.address,
    ohUsdtBank.address,
    usdt,
    compUsdtToken
  );
  const constructorArgs = [compLogic.address, proxyAdmin.address, data];

  const result = await deploy('OhUsdtCompoundStrategy', {
    from: deployer,
    contract: 'OhUpgradeableProxy',
    args: constructorArgs,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
  });
};

deploy.tags = ['OhUsdtCompoundStrategy'];
deploy.dependencies = ['OhRegistry', 'OhProxyAdmin', 'OhStrategy', 'OhUsdtBank'];
export default deploy;
