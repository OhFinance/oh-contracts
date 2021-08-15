import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeAaveV2StrategyData} from 'lib';

// deploy the Oh! USDT Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts, network, run} = hre;
  const {deployer, usdt, aaveUsdtToken} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('20 - Oh! USDT AaveV2 Strategy');

  const registry = await ethers.getContract('OhRegistry');
  const ohUsdtBank = await ethers.getContract('OhUsdtBank');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const aaveV2Logic = await ethers.getContract('OhAaveV2Strategy');

  // build the data's for the strategies
  const data = await getInitializeAaveV2StrategyData(registry.address, ohUsdtBank.address, usdt, aaveUsdtToken);
  const constructorArgs = [aaveV2Logic.address, proxyAdmin.address, data];

  const result = await deploy('OhUsdtAaveV2Strategy', {
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

deploy.tags = ['OhUsdtAaveV2Strategy'];
deploy.dependencies = ['OhRegistry', 'OhProxyAdmin', 'OhStrategy', 'OhUsdtBank'];
export default deploy;
