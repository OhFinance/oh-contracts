import {Signer} from 'ethers';
import {deployLiquidator, deployManager, setManager} from 'lib';

export const deploy = async (deployer: Signer, registry: string) => {
  const manager = await deployManager(deployer, registry);
  await setManager(deployer, registry, manager.address);

  const liquidator = await deployLiquidator(deployer, registry);
  // await setLiq

  return {
    manager,
    liquidator,
  };
};
