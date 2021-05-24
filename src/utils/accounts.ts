import {ethers} from 'hardhat';

export const getAccounts = async () => {
  const signers = await ethers.getSigners();

  return {
    deployer: signers[0],
    worker: signers[1],
    treasury: signers[2],
    strategic: signers[3],
    community: signers[4],
  };
};
