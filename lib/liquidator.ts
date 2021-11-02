import { getLiquidatorContract } from '../utils';

export const setSwapRoutes = async (deployer: string, liquidator: string, router:string, from: string, to: string, path: string[]) => {
  const liquidatorContract = await getLiquidatorContract(deployer, liquidator);
  await liquidatorContract.setSwapRoutes(router, from, to, path);
};

