import {ethers} from 'hardhat';
import {
  ERC20,
  OhAaveV2Strategy,
  OhBank,
  OhCompoundStrategy,
  OhCurve3PoolStrategy,
  OhForum,
  OhGovernor,
  OhLiquidatorV2,
  OhManager,
  OhProxyAdmin,
  OhRegistry,
  OhTimelock,
  OhToken,
  OhUpgradeableProxy,
} from '../types';

export const getERC20Contract = async (signer: string, at: string) => {
  return (await ethers.getContractAt('ERC20', at, signer)) as ERC20;
}

export const getUpgradeableProxy = async (signer: string, name: string, at?: string) => {
  if (at) {
    return (await ethers.getContractAt(name, at, signer)) as OhUpgradeableProxy;
  }
  return (await ethers.getContract(name, signer)) as OhUpgradeableProxy;
};

export const getUpgradeableProxyAt = async (signer: string, at: string) => {
  return (await ethers.getContractAt('OhUpgradeableProxy', at, signer)) as OhUpgradeableProxy;
}

// core

export const getRegistryContract = async (signer: string, at?: string) => {
  if (at) {
    return (await ethers.getContractAt('OhRegistry', at, signer)) as OhRegistry;
  }
  return (await ethers.getContract('OhRegistry', signer)) as OhRegistry;
};

export const getTokenContract = async (signer: string, at?: string) => {
  if (at) {
    return (await ethers.getContractAt('OhToken', at, signer)) as OhToken;
  }
  return (await ethers.getContract('OhToken', signer)) as OhToken;
};

export const getLiquidatorContract = async (signer: string, at?: string) => {
  if (at) {
    return (await ethers.getContract('OhLiquidatorV2', signer)) as OhLiquidatorV2;
  }
  return (await ethers.getContract('OhLiquidatorV2', signer)) as OhLiquidatorV2;
};

export const getManagerContract = async (signer: string, at?: string) => {
  if (at) {
    return (await ethers.getContractAt('OhManager', at, signer)) as OhManager;
  }
  return (await ethers.getContract('OhManager', signer)) as OhManager;
};

export const getProxyAdminContract = async (signer: string, at?: string) => {
  if (at) {
    return (await ethers.getContractAt('OhProxyAdmin', at, signer)) as OhProxyAdmin;
  }
  return (await ethers.getContract('OhProxyAdmin', signer)) as OhProxyAdmin;
};

export const getTimelockContract = async (name: string, signer: string) => {
  return (await ethers.getContract(name, signer)) as OhTimelock;
};

// governance

export const getGovernorContract = async (signer: string, at?: string) => {
  if (at) {
    return (await ethers.getContractAt('OhGovernor', at, signer)) as OhGovernor;
  }
  return (await ethers.getContract('OhGovernor', signer)) as OhGovernor;
};

export const getForumContract = async (signer: string, at?: string) => {
  if (at) {
    return (await ethers.getContractAt('OhForum', at, signer)) as OhForum;
  }
  return (await ethers.getContract('OhForum', signer)) as OhForum;
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

export const getUsdcCurve3PoolStrategyProxyContract = async (signer: string) => {
  return await getUpgradeableProxy(signer, 'OhUsdcCurve3PoolStrategy');
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
  const proxy = await getUsdcCurve3PoolStrategyProxyContract(signer);
  return await getCurve3PoolStrategyContract(signer, proxy.address);
};
