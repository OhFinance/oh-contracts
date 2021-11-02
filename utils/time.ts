import {ethers} from 'hardhat';

export const ONE_DAY = 86400;
export const TWO_DAYS = ONE_DAY * 2;
export const THREE_DAYS = ONE_DAY * 3;
export const NINE_DAYS = ONE_DAY * 9;
export const TEN_DAYS = ONE_DAY * 10;
export const FIFTEEN_DAYS = ONE_DAY * 15;

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
