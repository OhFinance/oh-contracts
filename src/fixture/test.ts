import {deployments, ethers} from 'hardhat';
import {OhLiquidator, OhManager, OhRegistry, OhTimelock, OhToken} from 'types';

const getTestContracts = async (signer: string) => {
  const registry = (await ethers.getContract('OhRegistry', signer)) as OhRegistry;
  const token = (await ethers.getContract('OhToken', signer)) as OhToken;

  return {
    address: signer,
    registry,
    token,
  };
};

const getVestingContracts = async (signer: string) => {
  const contracts = await getTestContracts(signer);
  const vesting = (await ethers.getContract('OhVestingTimelock', signer)) as OhTimelock;
  const foundation = (await ethers.getContract('OhFoundationTimelock', signer)) as OhTimelock;
  const growth = (await ethers.getContract('OhGrowthTimelock', signer)) as OhTimelock;
  const legal = (await ethers.getContract('OhLegalTimelock', signer)) as OhTimelock;

  return {
    ...contracts,
    vesting,
    foundation,
    growth,
    legal,
  };
};

const getManagementContracts = async (signer: string) => {
  const contracts = await getTestContracts(signer);
  const liquidator = (await ethers.getContract('OhLiquidator', signer)) as OhLiquidator;
  const manager = (await ethers.getContract('OhManager', signer)) as OhManager;

  return {
    ...contracts,
    liquidator,
    manager,
  };
};

export const setupTest = deployments.createFixture(async ({deployments, getNamedAccounts}) => {
  await deployments.fixture(['OhRegistry', 'OhToken']);
  const {deployer, worker} = await getNamedAccounts();

  return {
    deployer: await getTestContracts(deployer),
    worker: await getTestContracts(worker),
  };
});

export const setupVestingTest = deployments.createFixture(async ({deployments, getNamedAccounts}) => {
  await deployments.fixture(['OhTimelock']);
  const {deployer, worker} = await getNamedAccounts();

  return {
    deployer: await getVestingContracts(deployer),
    worker: await getVestingContracts(worker),
  };
});

export const setupManagementTest = deployments.createFixture(async ({deployments, getNamedAccounts}) => {
  await deployments.fixture(['OhManager', 'OhLiquidator']);
  const {deployer, worker} = await getNamedAccounts();

  return {
    deployer: await getManagementContracts(deployer),
    worker: await getManagementContracts(worker),
  };
});
