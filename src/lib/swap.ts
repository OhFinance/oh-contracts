import {Signer} from 'ethers';
import {ethers} from 'hardhat';
import {IUniswapV2Router02} from 'types';
import {addresses, execute} from 'utils';

export const getUniswapV2Router = async (deployer: Signer) => {
  const router = (await ethers.getContractAt(
    'IUniswapV2Router02',
    addresses.uniswapV2,
    deployer
  )) as IUniswapV2Router02;
  return router;
};

export const swapEthForTokens = async (
  deployer: Signer,
  token: string,
  value: string
) => {
  const router = await getUniswapV2Router(deployer);
  const address = await deployer.getAddress();
  const path = [addresses.weth, token];

  await execute(
    router.swapExactETHForTokens(0, path, address, Date.now() + 1000, {
      value: value,
    })
  );
};
