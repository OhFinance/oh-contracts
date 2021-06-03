import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deployer} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('10 - Strategy Logic');

  await deploy('OhAaveV2Strategy', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
  });

  await deploy('OhCompoundStrategy', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
  });

  await deploy('OhCurve3PoolStrategy', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
  });
};

deploy.tags = ['OhStrategy'];
export default deploy;
