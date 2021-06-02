import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeCompoundStrategyData} from 'lib';

// deploy the Oh! USDC Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts, network, run} = hre;
  const {deployer, usdc, compUsdcToken} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('11 - Oh! USDC Compound Strategy');
  const registry = await ethers.getContract('OhRegistry');
  const ohUsdcBank = await ethers.getContract('OhUsdcBank');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const aaveV2Logic = await ethers.getContract('OhCompoundStrategy');

  const data = getInitializeCompoundStrategyData(registry.address, ohUsdcBank.address, usdc, compUsdcToken);
  const constructorArgs = [aaveV2Logic.address, proxyAdmin.address, data];

  const result = await deploy('OhUsdcCompoundStrategy', {
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

deploy.tags = ['OhUsdcCompoundStrategy'];
deploy.dependencies = ['OhRegistry', 'OhProxyAdmin', 'OhCompoundStrategy', 'OhUsdcBank'];
export default deploy;
