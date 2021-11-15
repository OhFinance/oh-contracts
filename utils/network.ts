import {ethers, network} from 'hardhat';

export const getLatestBlock = async () => {
  return await ethers.provider.getBlock('latest');
};

export const impersonateAccount = async (accounts: string[]) => {
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: accounts
  })
}