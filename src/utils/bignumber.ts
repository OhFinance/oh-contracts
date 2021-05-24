import {BigNumber} from 'ethers';

export const getDecimalNumber = (value: number, decimals?: number) => {
  return BigNumber.from(value).mul(BigNumber.from(10).pow(decimals || 18));
};

export const getDecimalString = (value: number, decimals?: number) => {
  return BigNumber.from(value)
    .mul(BigNumber.from(10).pow(decimals || 18))
    .toString();
};
