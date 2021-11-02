import {ethers} from 'hardhat';
import {
  ERC20,
  OhAaveV2Strategy,
  OhBank,
  OhCompoundStrategy,
  OhCurve3PoolStrategy,
  OhForum,
  OhGovernor,
  OhManager,
  OhRegistry,
  OhStrategy,
  OhUpgradeableProxy,
} from '../types';

export const getErc20At = async (address: string, signer: string) => {
  return (await ethers.getContractAt('ERC20', address, signer)) as ERC20;
};

export const getRegistryAt = async (address: string, signer: string) => {
  return (await ethers.getContractAt('OhRegistry', address, signer)) as OhRegistry;
};

export const getManagerAt = async (address: string, signer?: string) => {
  return (await ethers.getContractAt('OhManager', address, signer)) as OhManager;
};

export const getGovernorAt = async (address: string, signer?: string) => {
  return (await ethers.getContractAt('OhGovernor', address, signer)) as OhGovernor;
};

export const getForumAt = async (address: string, signer?: string) => {
  return (await ethers.getContractAt('OhForum', address, signer)) as OhForum;
};

export const getBankAt = async (address: string, signer: string) => {
  return (await ethers.getContractAt('OhBank', address, signer)) as OhBank;
};

export const getStrategyAt = async (address: string, signer: string) => {
  return (await ethers.getContractAt('OhStrategy', address, signer)) as OhStrategy;
};

export const getProxyAt = async (address: string, signer: string) => {
  return (await ethers.getContractAt('OhUpgradeableProxy', address, signer)) as OhUpgradeableProxy;
};

export const getAaveV2StrategyAt = async (address: string, signer?: string) => {
  return (await ethers.getContractAt('OhAaveV2Strategy', address, signer)) as OhAaveV2Strategy;
};

export const getCompoundStrategyAt = async (address: string, signer?: string) => {
  return (await ethers.getContractAt('OhCompoundStrategy', address, signer)) as OhCompoundStrategy;
};

export const getCurve3PoolStrategyAt = async (address: string, signer?: string) => {
  return (await ethers.getContractAt('OhCurve3PoolStrategy', address, signer)) as OhCurve3PoolStrategy;
};
