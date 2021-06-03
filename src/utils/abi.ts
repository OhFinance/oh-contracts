import {Interface} from 'ethers/lib/utils';
import {ethers} from 'hardhat';

export const getFunctionName = (contractInterface: Interface, name: string) => {
  return Object.keys(contractInterface.functions).filter((key) => key.includes(name))[0];
};

export const getFunctionSignature = (contractInterface: Interface, functionName: string) => {
  return contractInterface.getSighash(functionName);
};

export const getFunctionData = (
  contractInterface: Interface,
  functionName: string,
  args?: any[]
) => {
  return contractInterface.encodeFunctionData(contractInterface.functions[functionName], args);
};

export const getCallData = (types: string[], values: any[]) => {
  const abi = new ethers.utils.AbiCoder();
  return abi.encode(types, values);
};
