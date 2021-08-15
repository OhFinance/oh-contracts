import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeCompoundStrategyData} from 'lib';

// deploy the Oh! DAI Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts, network, run} = hre;
  const {deployer, dai, compDaiToken} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('13 - Oh! DAI Compound Strategy');

  const registry = await ethers.getContract('OhRegistry');
  const ohDaiBank = await ethers.getContract('OhDaiBank');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const aaveV2Logic = await ethers.getContract('OhCompoundStrategy');

  const data = await getInitializeCompoundStrategyData(registry.address, ohDaiBank.address, dai, compDaiToken);
  const constructorArgs = [aaveV2Logic.address, proxyAdmin.address, data];

  const result = await deploy('OhDaiCompoundStrategy', {
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

deploy.tags = ['OhDaiCompoundStrategy'];
deploy.dependencies = ['OhRegistry', 'OhProxyAdmin', 'OhStrategy', 'OhDaiBank'];
export default deploy;
