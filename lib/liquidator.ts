import { getLiquidatorContract } from './contract';

export const setSwapRoutes = async (deployer: string, liquidator: string, router:string, from: string, to: string, path: string[]) => {
  const liquidatorContract = await getLiquidatorContract(deployer, liquidator);
  const tx = await liquidatorContract.setSwapRoutes(router, from, to, path);
  await tx.wait();
};

