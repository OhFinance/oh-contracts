import {ethers} from 'hardhat';
import {
  OhAaveV2Strategy,
  OhBank,
  OhCompoundStrategy,
  OhCurve3PoolStrategy,
  OhLiquidator,
  OhManager,
  OhProxyAdmin,
  OhRegistry,
  OhToken,
  OhUpgradeableProxy,
} from 'types';

const getUpgradeableProxy = async (signer: string, name: string) => {
  return (await ethers.getContract(name, signer)) as OhUpgradeableProxy;
};

// core

export const getRegistryContract = async (signer: string) => {
  return (await ethers.getContract('OhRegistry', signer)) as OhRegistry;
};

export const getTokenContract = async (signer: string) => {
  return (await ethers.getContract('OhToken', signer)) as OhToken;
};

export const getLiquidatorContract = async (signer: string) => {
  return (await ethers.getContract('OhLiquidator', signer)) as OhLiquidator;
};

export const getManagerContract = async (signer: string) => {
  return (await ethers.getContract('OhManager', signer)) as OhManager;
};

export const getProxyAdminContract = async (signer: string) => {
  return (await ethers.getContract('OhProxyAdmin', signer)) as OhProxyAdmin;
};

// bank

export const getBankContract = async (signer: string, at?: string) => {
  if (at) {
    return (await ethers.getContractAt('OhBank', at, signer)) as OhBank;
  }
  return (await ethers.getContract('OhBank', signer)) as OhBank;
};

export const getAaveV2StrategyContract = async (signer: string, at?: string) => {
  if (at) {
    return (await ethers.getContractAt('OhAaveV2Strategy', at, signer)) as OhAaveV2Strategy;
  }
  return (await ethers.getContract('OhAaveV2Strategy', signer)) as OhAaveV2Strategy;
};

export const getCompoundStrategyContract = async (signer: string, at?: string) => {
  if (at) {
    return (await ethers.getContractAt('OhCompoundStrategy', at, signer)) as OhCompoundStrategy;
  }
  return (await ethers.getContract('OhCompoundStrategy', signer)) as OhCompoundStrategy;
};

export const getCurve3PoolStrategyContract = async (signer: string, at?: string) => {
  if (at) {
    return (await ethers.getContractAt('OhCurve3PoolStrategy', at, signer)) as OhCurve3PoolStrategy;
  }
  return (await ethers.getContract('OhCurve3PoolStrategy', signer)) as OhCurve3PoolStrategy;
};

// oh-usdc

export const getUsdcBankProxyContract = async (signer: string) => {
  return await getUpgradeableProxy(signer, 'OhUsdcBank');
};

export const getUsdcAaveV2StrategyProxyContract = async (signer: string) => {
  return await getUpgradeableProxy(signer, 'OhUsdcAaveV2Strategy');
};

export const getUsdcCompoundStrategyProxyContract = async (signer: string) => {
  return await getUpgradeableProxy(signer, 'OhUsdcCompoundStrategy');
};

export const getCurve3PoolStrategyProxyContract = async (signer: string) => {
  return await getUpgradeableProxy(signer, 'OhCurve3PoolStrategy');
};

export const getUdscBankContract = async (signer: string) => {
  const proxy = await getUsdcBankProxyContract(signer);
  return await getBankContract(signer, proxy.address);
};

export const getUsdcAaveV2StrategyContract = async (signer: string) => {
  const proxy = await getUsdcAaveV2StrategyProxyContract(signer);
  return await getAaveV2StrategyContract(signer, proxy.address);
};

export const getUsdcCompoundStrategyContract = async (signer: string) => {
  const proxy = await getUsdcCompoundStrategyProxyContract(signer);
  return await getCompoundStrategyContract(signer, proxy.address);
};

export const getUsdcCurve3PoolStrategyContract = async (signer: string) => {
  const proxy = await getCurve3PoolStrategyProxyContract(signer);
  return await getCurve3PoolStrategyContract(signer, proxy.address);
};
