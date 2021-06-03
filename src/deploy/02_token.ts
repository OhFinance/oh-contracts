import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deployer} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('2 - Token');

  const registry = await ethers.getContract('OhRegistry');

  await deploy('OhToken', {
    from: deployer,
    args: [registry.address],
    log: true,
    deterministicDeployment: false,
  });
};

deploy.tags = ['OhToken'];
deploy.dependencies = ['OhRegistry'];
export default deploy;
