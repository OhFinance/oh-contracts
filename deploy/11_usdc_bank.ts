import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeBankData} from 'lib';

// deploy the Oh! USDC Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts, network, run} = hre;
  const {deployer, usdc} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('9 - Oh! USDC Bank');

  const registry = await ethers.getContract('OhRegistry');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const bankLogic = await ethers.getContract('OhBank');

  // get Oh! USDC Bank initializer bytecode
  const data = getInitializeBankData('Oh! USDC', 'Oh! USDC', registry.address, usdc);
  const constructorArguments = [bankLogic.address, proxyAdmin.address, data];

  // deploy the Oh! USDC Bank Proxy
  const ohUsdcBank = await deploy('OhUsdcBank', {
    from: deployer,
    contract: 'OhUpgradeableProxy',
    args: constructorArguments,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
  });

  // verify the contract
  if (ohUsdcBank.newlyDeployed && network.live) {
    await run('verify:verify', {
      address: ohUsdcBank.address,
      constructorArguments,
    });
  }
};

deploy.tags = ['OhUsdcBank'];
deploy.dependencies = ['OhRegistry', 'OhBank', 'OhProxyAdmin'];
export default deploy;
