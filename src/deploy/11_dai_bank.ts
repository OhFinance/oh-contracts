import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeBankData} from 'lib';

// deploy the Oh! DAI Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts, network, run} = hre;
  const {deployer, dai} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('11 - Oh! DAI Bank');

  const registry = await ethers.getContract('OhRegistry');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const bankLogic = await ethers.getContract('OhBank');

  // get Oh! DAI Bank initializer bytecode
  const data = getInitializeBankData('Oh! DAI', 'OH-DAI', registry.address, dai);
  const constructorArguments = [bankLogic.address, proxyAdmin.address, data];

  // deploy the Oh! DAI Bank Proxy
  const result = await deploy('OhDaiBank', {
    from: deployer,
    contract: 'OhUpgradeableProxy',
    args: constructorArguments,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
  });

  // verify the contract
  if (result.newlyDeployed && network.live) {
    await run('verify:verify', {
      address: result.address,
      constructorArguments,
    });
  }
};

deploy.tags = ['OhDaiBank'];
deploy.dependencies = ['OhRegistry', 'OhBank', 'OhProxyAdmin'];
export default deploy;