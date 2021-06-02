import {parseEther} from '@ethersproject/units';
import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deployer} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('11 - Forum');

  const registry = await ethers.getContract('OhRegistry');
  const token = await ethers.getContract('OhToken');

  await deploy('OhForum', {
    from: deployer,
    args: [
      registry.address,
      token.address,
      1, // 1 block review
      17280, // 3 days in blocks
      parseEther('1000000'), // 1m tokens to propose
    ],
    log: true,
  });
};

deploy.tags = ['OhForum'];
deploy.dependencies = ['OhRegistry', 'OhToken'];
export default deploy;
