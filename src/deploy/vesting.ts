import {parseEther} from '@ethersproject/units';
import {BigNumberish, Signer} from 'ethers';
import {ethers} from 'hardhat';
import {deployTimelock, getErc20At} from 'lib';
import {OhTimelock} from 'types';
import {addresses, execute} from 'utils';

// time periods in seconds
const ONE_MONTH = 2592000; // 30 days
const FIVE_MONTHS = 12960000; // 150 days
const EIGHT_MONTHS = 20736000; // 240 days
const ONE_YEAR = 31104000; // 360 days
const FOUR_YEARS = 124416000; // 1440 days

export const deploy = async (deployer: Signer, registry: string, token: string) => {
  const timelock = await deployPrivate(deployer, registry, token);
  const foundation = await deployFoundation(deployer, registry, token);
  const funds = await deployFunds(deployer, registry, token);
  const legal = await deployLegal(deployer, registry, token);

  return {
    timelock,
    foundation,
    funds,
    legal,
  };
};

export const deployPrivate = async (deployer: Signer, registry: string, token: string) => {
  const timelock = await deployTimelock(deployer, registry, token, ONE_MONTH, EIGHT_MONTHS);

  return timelock;
};

export const deployFoundation = async (deployer: Signer, registry: string, token: string) => {
  const timelock = await deployTimelock(deployer, registry, token, ONE_MONTH, FOUR_YEARS);

  // foundation, 20m
  await addRecipients(deployer, timelock, [addresses.treasury], [parseEther('20000000')]);

  return timelock;
};

export const deployFunds = async (deployer: Signer, registry: string, token: string) => {
  const timelock = await deployTimelock(deployer, registry, token, ONE_MONTH, ONE_YEAR);

  // community, 2.5m
  // strategic, 4m
  await addRecipients(deployer, timelock, [addresses.community, addresses.strategic], [parseEther('2500000'), parseEther('4000000')]);

  return timelock;
};

export const deployLegal = async (deployer: Signer, registry: string, token: string) => {
  const timelock = await deployTimelock(deployer, registry, token, ONE_MONTH, FIVE_MONTHS);

  return timelock;
};

const addRecipients = async (deployer: Signer, timelock: OhTimelock, recipients: string[], amounts: BigNumberish[]) => {
  const token = await timelock.token();

  const tokenContract = await getErc20At(token, deployer);
  await tokenContract.approve(timelock.address, ethers.constants.MaxUint256);
  await timelock.add(recipients, amounts);
};
