// import {ethers} from 'hardhat';
import {Signer} from 'ethers';
import {ethers} from 'hardhat';
import {execute} from 'utils';
import {getBankAt} from './contract';
import OhBank from 'abi/OhBank.json';

export const initializeBank = async (
  deployer: Signer,
  bank: string,
  name: string,
  symbol: string,
  registry: string,
  underlying: string
) => {
  const bankContract = await getBankAt(bank, deployer);
  // await execute(
  //   bankContract.initializeBank(name, symbol, registry, underlying)
  // );
};

export const getInitializeBankData = (
  name: string,
  symbol: string,
  registry: string,
  underlying: string
) => {
  const signature = ['function initializeBank(string,string,address,address)'];
  const bankInterface = new ethers.utils.Interface(signature);
  const initializeData = bankInterface.encodeFunctionData(
    'initializeBank(string,string,address,address)',
    [name, symbol, registry, underlying]
  );
  return initializeData;
};
