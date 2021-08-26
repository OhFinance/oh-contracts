import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deployer} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('6 - Proxy Admin');

  const registry = await ethers.getContract('OhRegistry');

  await deploy('OhProxyAdmin', {
    from: deployer,
    args: [registry.address],
    log: true,
    deterministicDeployment: false,
  });
};

deploy.tags = ['OhProxyAdmin'];
deploy.dependencies = ['OhRegistry'];
export default deploy;
