import {Signer} from 'ethers';
import {deployLiquidator, deployManager, setManager} from 'lib';
import {setSushiswapRoutes, setUniswapRoutes} from 'lib/liquidator';
import {addresses} from 'utils';

export const deploy = async (deployer: Signer, registry: string, token: string) => {
  const manager = await deployManager(deployer, registry, token);
  await setManager(deployer, registry, manager.address);

  const liquidator = await deployLiquidator(deployer, registry);

  // await setSushiswapRoutes(liquidator, addresses.aave, addresses.usdc, []);
  // await setSushiswapRoutes(liquidator, addresses.comp, addresses.usdc, []);
  // await setSushiswapRoutes(liquidator, addresses.crv, addresses.usdc, []);
  // await setUniswapRoutes(liquidator, addresses.usdc, token, []);

  return {
    manager,
    liquidator,
  };
};
