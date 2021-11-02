import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deployer} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('Core - Token');

  const registry = await ethers.getContract('OhRegistry');

  await deploy('OhToken', {
    from: deployer,
    args: [registry.address],
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: true
  });
};

deploy.tags = ['Core', 'OhToken'];
deploy.dependencies = ['OhRegistry'];
export default deploy;
