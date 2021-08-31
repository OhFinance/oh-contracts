import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deployer} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('9 - Bank Logic');

  await deploy('OhBank', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
  });
};

deploy.tags = ['Core', 'OhBank'];
deploy.dependencies = ['OhManager', 'OhLiquidator'];
export default deploy;
