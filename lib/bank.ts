import {ethers} from 'hardhat';
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
