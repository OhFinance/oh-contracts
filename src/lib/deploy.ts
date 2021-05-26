import {
  OhAaveV2Strategy,
  OhBank,
  OhCompoundStrategy,
  OhCurve3PoolStrategy,
  OhForum,
  OhGovernor,
  OhLiquidator,
  OhManager,
  OhProxyAdmin,
  OhRegistry,
  OhToken,
} from 'types';
import {Signer} from 'ethers';
import {addresses, deployContract} from 'utils';

export const deployRegistry = async (deployer: Signer) => {
  const registry = (await deployContract(deployer, 'OhRegistry')) as OhRegistry;
  return registry;
};

export const deployToken = async (deployer: Signer, registry: string) => {
  const token = (await deployContract(
    deployer,
    'OhToken',
    registry
  )) as OhToken;
  return token;
};

export const deployLiquidator = async (deployer: Signer, registry: string) => {
  const liquidiator = (await deployContract(
    deployer,
    'OhLiquidator',
    registry,
    addresses.uniswapV2,
    addresses.sushiswapV2
  )) as OhLiquidator;
  return liquidiator;
};

export const deployForum = async (
  deployer: Signer,
  registry: string,
  token: string,
  votingDelay: number,
  votingPeriod: number,
  proposalThreshold: string
) => {
  const forum = (await deployContract(
    deployer,
    'OhForum',
    registry,
    token,
    votingDelay,
    votingPeriod,
    proposalThreshold
  )) as OhForum;
  return forum;
};

export const deployGovernor = async (
  deployer: Signer,
  registry: string,
  admin: string,
  delay: number
) => {
  const governor = (await deployContract(
    deployer,
    'OhGovernor',
    admin,
    delay
  )) as OhGovernor;
  return governor;
};

export const deployManager = async (deployer: Signer, registry: string) => {
  const manager = (await deployContract(
    deployer,
    'OhManager',
    registry
  )) as OhManager;
  return manager;
};

export const deployProxyAdmin = async (deployer: Signer, registry: string) => {
  const proxyAdmin = (await deployContract(
    deployer,
    'OhProxyAdmin',
    registry
  )) as OhProxyAdmin;
  return proxyAdmin;
};

export const deployBank = async (deployer: Signer) => {
  const bank = (await deployContract(deployer, 'OhBank')) as OhBank;
  return bank;
};

export const deployAaveV2Strategy = async (deployer: Signer) => {
  const strategy = (await deployContract(
    deployer,
    'OhAaveV2Strategy'
  )) as OhAaveV2Strategy;
  return strategy;
};

export const deployCompoundStrategy = async (deployer: Signer) => {
  const strategy = (await deployContract(
    deployer,
    'OhCompoundStrategy'
  )) as OhCompoundStrategy;
  return strategy;
};

export const deployCurve3PoolStrategy = async (deployer: Signer) => {
  const strategy = (await deployContract(
    deployer,
    'OhCurve3PoolStrategy'
  )) as OhCurve3PoolStrategy;
  return strategy;
};
