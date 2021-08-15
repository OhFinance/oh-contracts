import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeBankData} from 'lib';

// deploy the Oh! USDT Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts, network, run} = hre;
  const {deployer, usdt} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('19 - Oh! USDT Bank');

  const registry = await ethers.getContract('OhRegistry');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const bankLogic = await ethers.getContract('OhBank');

  // get Oh! USDT Bank initializer bytecode
  const data = getInitializeBankData('Oh! USDT', 'OH-USDT', registry.address, usdt);
  const constructorArguments = [bankLogic.address, proxyAdmin.address, data];

  // deploy the Oh! USDT Bank Proxy
  const result = await deploy('OhUsdtBank', {
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

deploy.tags = ['OhUsdtBank'];
deploy.dependencies = ['OhRegistry', 'OhBank', 'OhProxyAdmin'];
export default deploy;