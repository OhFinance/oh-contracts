import {Signer} from 'ethers';
import {getManagerAt} from './contract';

export const setBank = async (deployer: Signer, manager: string, bank: string) => {
  const managerContract = await getManagerAt(manager, deployer);
  await managerContract.setBank(bank, true);
};

export const addStrategy = async (deployer: Signer, manager: string, bank: string, strategy: string) => {
  const managerContract = await getManagerAt(manager, deployer);
  await managerContract.addStrategy(bank, strategy);
};
