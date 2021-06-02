import {Signer} from 'ethers';
import {deployLiquidator, deployManager, setLiquidator, setManager} from 'lib';
import {setSushiswapRoutes, setUniswapRoutes} from 'lib/liquidator';
import {addresses} from 'utils';

export const deploy = async (deployer: Signer, registry: string, token: string) => {
  const manager = await deployManager(deployer, registry, token);
  await setManager(deployer, registry, manager.address);

  const liquidator = await deployLiquidator(deployer, registry);

  await setSushiswapRoutes(liquidator, addresses.aave, addresses.usdc, [addresses.aave, addresses.weth, addresses.usdc]);
  await setSushiswapRoutes(liquidator, addresses.comp, addresses.usdc, [addresses.comp, addresses.weth, addresses.usdc]);
  await setSushiswapRoutes(liquidator, addresses.crv, addresses.usdc, [addresses.crv, addresses.weth, addresses.usdc]);
  // await setUniswapRoutes(liquidator, addresses.usdc, token, []);

  await setLiquidator(deployer, manager.address, liquidator.address, addresses.aave, addresses.usdc);
  await setLiquidator(deployer, manager.address, liquidator.address, addresses.comp, addresses.usdc);
  await setLiquidator(deployer, manager.address, liquidator.address, addresses.crv, addresses.usdc);

  return {
    manager,
    liquidator,
  };
};
