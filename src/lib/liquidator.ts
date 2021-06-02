import {OhLiquidator} from 'types';

export const setUniswapRoutes = async (liquidator: OhLiquidator, from: string, to: string, path: string[]) => {
  await liquidator.setUniswapRoutes(from, to, path);
};

export const setSushiswapRoutes = async (liquidator: OhLiquidator, from: string, to: string, path: string[]) => {
  await liquidator.setSushiswapRoutes(from, to, path);
};
