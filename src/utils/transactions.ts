import {ContractTransaction} from 'ethers';

export const execute = async (transaction: Promise<ContractTransaction>) => {
  const tx = await transaction;
  console.log('Sending transaction', tx.hash, 'with', tx.from);
  await tx.wait();
  return tx.blockHash;
};
