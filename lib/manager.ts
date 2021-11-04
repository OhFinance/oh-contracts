import { getManagerContract } from './contract';

export const addBank = async (deployer: string, manager: string, bank: string) => {
  const managerContract = await getManagerContract(deployer, manager);
  const tx = await managerContract.setBank(bank, true);
  await tx.wait();
};

export const removeBank = async (deployer: string, manager: string, bank: string) => {
  const managerContract = await getManagerContract(deployer, manager);
  const tx = await managerContract.setBank(bank, false);
  await tx.wait();
};

export const addStrategy = async (
  deployer: string,
  manager: string,
  bank: string,
  strategy: string
) => {
  const managerContract = await getManagerContract(deployer, manager);
  const tx = await managerContract.setStrategy(bank, strategy, true);
  await tx.wait();
};

export const removeStrategy = async (
  deployer: string,
  manager: string,
  bank: string,
  strategy: string
) => {
  const managerContract = await getManagerContract(deployer, manager);
  const tx = await managerContract.setStrategy(bank, strategy, false);
  await tx.wait();
};

export const setLiquidator = async (
  deployer: string,
  manager: string,
  liquidator: string,
  from: string,
  to: string
) => {
  const managerContract = await getManagerContract(deployer, manager);
  const tx = await managerContract.setLiquidator(liquidator, from, to);
  await tx.wait();
};

export const exit = async (deployer: string, manager: string, bank: string, strategy: string) => {
  const managerContract = await getManagerContract(deployer, manager);
  const tx = await managerContract.exit(bank, strategy);
  await tx.wait()
}

export const exitAll = async (deployer: string, manager: string, bank: string) => {
  const managerContract = await getManagerContract(deployer, manager);
  const tx = await managerContract.exitAll(bank);
  await tx.wait()
}

export const finance = async (signer: string, manager: string, bank: string) => {
  const managerContract = await getManagerContract(signer, manager);
  const tx = await managerContract.finance(bank);
  await tx.wait()
}

export const financeAll = async (signer: string, manager: string, bank: string) => {
  const managerContract = await getManagerContract(signer, manager);
  const tx = await managerContract.financeAll(bank);
  await tx.wait()
}

export const rebalance = async (signer: string, manager: string, bank: string) => {
  const managerContract = await getManagerContract(signer, manager);
  const tx = await managerContract.rebalance(bank);
  await tx.wait();
}

export const buyback = async (signer: string, manager: string, from: string) => {
  const managerContract = await getManagerContract(signer, manager);
  const tx = await managerContract.buyback(from);
  await tx.wait()
}