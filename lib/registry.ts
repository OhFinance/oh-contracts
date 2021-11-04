import { getRegistryContract } from './contract';

export const setGovernance = async (deployer: string, registry: string, governance: string) => {
  const registryContract = await getRegistryContract(deployer, registry);
  const tx = await registryContract.setGovernance(governance);
  await tx.wait()
};

export const setManager = async (deployer: string, registry: string, manager: string) => {
  const registryContract = await getRegistryContract(deployer, registry);
  const tx = await registryContract.setManager(manager);
  await tx.wait()
};
