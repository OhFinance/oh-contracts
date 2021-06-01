import {ethers} from 'hardhat';

export const advanceNBlocks = async (n: number) => {
  for (let i = 0; i < n; i++) {
    await ethers.provider.send('evm_mine', []);
  }
};

export const advanceNSeconds = async (n: number) => {
  await ethers.provider.send('evm_increaseTime', [n]);
};

export const advanceToTimestamp = async (timestamp: number) => {
  await ethers.provider.send('evm_setNextBlockTimestamp', [timestamp]);
  await advanceNBlocks(1);
};
