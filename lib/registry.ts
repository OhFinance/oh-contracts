import {getRegistryAt} from './contract';

export const setGovernance = async (deployer: string, registry: string, governance: string) => {
  const registryContract = await getRegistryAt(registry, deployer);
  await registryContract.setGovernance(governance);
};

export const setManager = async (deployer: string, registry: string, manager: string) => {
  const registryContract = await getRegistryAt(registry, deployer);
  await registryContract.setManager(manager);
};
