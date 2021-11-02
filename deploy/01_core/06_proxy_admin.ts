import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deployer} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('Core - Proxy Admin');

  const registry = await ethers.getContract('OhRegistry');

  await deploy('OhProxyAdmin', {
    from: deployer,
    args: [registry.address],
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: true
  });
};

deploy.tags = ['Core', 'OhProxyAdmin'];
deploy.dependencies = ['OhRegistry'];
export default deploy;
