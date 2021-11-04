import { BigNumberish } from '@ethersproject/bignumber';
import {ethers} from 'hardhat';
import { getBankContract } from './contract';
import OhBank from '../abi/OhBank.json';

export const getInitializeBankData = (name: string, symbol: string, registry: string, underlying: string) => {
  const bankInterface = new ethers.utils.Interface(OhBank);
  const initializeData = bankInterface.encodeFunctionData('initializeBank(string,string,address,address)', [
    name,
    symbol,
    registry,
    underlying,
  ]);
  return initializeData;
};

export const deposit = async (signer:string, bank:string, amount: BigNumberish) => {
  const bankContract = await getBankContract(signer, bank);
  const tx = await bankContract.deposit(amount);
  await tx.wait()
}

export const withdraw = async (signer:string, bank:string, amount: BigNumberish) => {
  const bankContract = await getBankContract(signer, bank);
  const tx = await bankContract.withdraw(amount);
  await tx.wait()
}