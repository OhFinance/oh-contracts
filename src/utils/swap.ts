import {BigNumberish} from 'ethers';
import {ethers, getNamedAccounts} from 'hardhat';
import {IUniswapV2Router02} from 'types';

export const getUniswapV2Router = async (signer: string) => {
  const {uniswapV2} = await getNamedAccounts();
  const router = (await ethers.getContractAt(
    'IUniswapV2Router02',
    uniswapV2,
    signer
  )) as IUniswapV2Router02;
  return router;
};

export const getSushiswapV2Router = async (signer: string) => {
  const {sushiswapV2} = await getNamedAccounts();
  const router = (await ethers.getContractAt(
    'IUniswapV2Router02',
    sushiswapV2,
    signer
  )) as IUniswapV2Router02;
  return router;
};

export const swapEthForTokens = async (signer: string, token: string, value: BigNumberish) => {
  const {weth} = await getNamedAccounts();
  const router = await getSushiswapV2Router(signer);
  const path = [weth, token];

  await router.swapExactETHForTokens(0, path, signer, Date.now() + 1000, {
    value,
  });
};

export const addLiquidityEth = async (
  signer: string,
  token: string,
  amount: BigNumberish,
  value: BigNumberish
) => {
  const router = await getSushiswapV2Router(signer);

  await router.addLiquidityETH(token, amount, 0, 0, signer, Date.now() + 1000, {
    value,
  });
};
