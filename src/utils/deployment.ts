import {ethers, network, run} from 'hardhat';
import {Signer} from 'ethers';
import {OhUpgradeableProxy} from 'types';

export const deployContract = async (deployer: Signer, name: string, ...args: any[]) => {
  const factory = await ethers.getContractFactory(name, deployer);
  const contract = await factory.deploy(...args);
  // console.log(
  //   'Deploying',
  //   name,
  //   'with txn hash',
  //   contract.deployTransaction.hash
  // );
  await contract.deployed();
  // console.log(name, 'deployed to', contract.address);

  // if (network.name === 'mainnet') {
  // await run('verify:verify', {
  //   address: contract.address,
  //   constructorArguments: args,
  // });
  // }

  return contract;
};

export const deployProxyContract = async (deployer: Signer, logic: string, admin: string, data?: string) => {
  const factory = await ethers.getContractFactory('OhUpgradeableProxy', deployer);
  const contract = (await factory.deploy(logic, admin, data || '0x')) as OhUpgradeableProxy;
  // console.log(
  //   'Deploying proxy for logic',
  //   logic,
  //   'with txn hash',
  //   contract.deployTransaction.hash
  // );
  await contract.deployed();
  // console.log('Proxy deployed to', contract.address);

  // if (network.name === 'mainnet') {
  // await run('verify:verify', {
  //   address: contract.address,
  //   constructorArguments: args,
  // });
  // }

  return contract;
};
