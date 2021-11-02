import {getManagerAt} from './contract';

export const setBank = async (deployer: string, manager: string, bank: string) => {
  const managerContract = await getManagerAt(manager, deployer);
  await managerContract.setBank(bank, true);
};

export const addStrategy = async (
  deployer: string,
  manager: string,
  bank: string,
  strategy: string
) => {
  const managerContract = await getManagerAt(manager, deployer);
  await managerContract.setStrategy(bank, strategy, true);
};

export const setLiquidator = async (
  deployer: string,
  manager: string,
  liquidator: string,
  from: string,
  to: string
) => {
  const managerContract = await getManagerAt(manager, deployer);
  await managerContract.setLiquidator(liquidator, from, to);
};
