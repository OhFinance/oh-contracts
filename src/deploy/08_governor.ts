import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {TWO_DAYS} from 'utils';

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deployer} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('8 - Governor');

  const forum = await ethers.getContract('OhForum');

  await deploy('OhGovernor', {
    from: deployer,
    args: [forum.address, TWO_DAYS],
    log: true,
  });
};

deploy.tags = ['OhGovernor'];
deploy.dependencies = ['OhForum'];
export default deploy;
