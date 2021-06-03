import {network} from 'hardhat';
import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {OhGovernor, OhProxyAdmin, OhRegistry} from 'types';

// Relinquish Governance Rights
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deployer} = await getNamedAccounts();
  const {log} = deployments;

  log('15 - Governance');

  const admin = (await ethers.getContract('OhProxyAdmin', deployer)) as OhProxyAdmin;
  const registry = (await ethers.getContract('OhRegistry', deployer)) as OhRegistry;
  const governor = (await ethers.getContract('OhGovernor')) as OhGovernor;

  await admin.transferOwnership(governor.address);
  await registry.setGovernance(governor.address);

  return network.live;
};

// deploy.skip = async (hre: HardhatRuntimeEnvironment) => {
//   const {network} = hre;
//   if (!network.live) {
//     return true;
//   } else {
//     return false;
//   }
// };

deploy.id = '1';
deploy.tags = ['OhGovernance'];
deploy.dependencies = ['OhRegistry', 'OhProxyAdmin', 'OhGovernor'];
export default deploy;
