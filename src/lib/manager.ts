import {Signer} from 'ethers';
import {execute} from 'utils';
import {getManagerAt} from './contract';

export const addBank = async (
  deployer: Signer,
  manager: string,
  bank: string
) => {
  const managerContract = await getManagerAt(manager, deployer);
  await execute(managerContract.setBank(bank, true));
};

export const addStrategy = async (
  deployer: Signer,
  manager: string,
  bank: string,
  strategy: string
) => {
  const managerContract = await getManagerAt(manager, deployer);
  await execute(managerContract.addStrategy(bank, strategy));
};
