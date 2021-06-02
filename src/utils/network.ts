import {ethers} from 'hardhat';

export const getLatestBlock = async () => {
  return await ethers.provider.getBlock('latest');
};
