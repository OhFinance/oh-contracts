import {Signer} from 'ethers';
import {deployRegistry, deployToken} from 'lib';

export const deploy = async (deployer: Signer) => {
  const registry = await deployRegistry(deployer);
  const token = await deployToken(deployer, registry.address);

  // self-delegate to kick off proposals later
  // const address = await deployer.getAddress();

  return {
    registry,
    token,
  };
};
