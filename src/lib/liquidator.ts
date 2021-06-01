import {OhLiquidator} from 'types';
import {execute} from 'utils';

export const setUniswapRoutes = async (liquidator: OhLiquidator, from: string, to: string, path: string[]) => {
  await execute(liquidator.setUniswapRoutes(from, to, path));
};

export const setSushiswapRoutes = async (liquidator: OhLiquidator, from: string, to: string, path: string[]) => {
  await execute(liquidator.setSushiswapRoutes(from, to, path));
};
