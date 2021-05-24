import {Signer} from 'ethers';
import {execute} from 'utils';
import {getRegistryAt} from './contract';

export const setGovernance = async (
  deployer: Signer,
  registry: string,
  governance: string
) => {
  const registryContract = await getRegistryAt(registry, deployer);
  await execute(registryContract.setGovernance(governance));
};

export const setManager = async (
  deployer: Signer,
  registry: string,
  manager: string
) => {
  const registryContract = await getRegistryAt(registry, deployer);
  await execute(registryContract.setManager(manager));
};
