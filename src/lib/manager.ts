import {ethers} from 'hardhat';
import {Signer} from 'ethers';
import {getManagerAt} from './contract';

export const setBank = async (deployer: Signer, manager: string, bank: string) => {
  const managerContract = await getManagerAt(manager, deployer);
  await managerContract.setBank(bank, true);
};

export const addStrategy = async (
  deployer: Signer,
  manager: string,
  bank: string,
  strategy: string
) => {
  const managerContract = await getManagerAt(manager, deployer);
  await managerContract.addStrategy(bank, strategy);
};

export const setLiquidator = async (
  deployer: Signer,
  manager: string,
  liquidator: string,
  from: string,
  to: string
) => {
  const managerContract = await getManagerAt(manager, deployer);
  await managerContract.setLiquidator(liquidator, from, to);
};
