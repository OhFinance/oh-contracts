import {TransactionResponse} from '@ethersproject/abstract-provider';

export const execute = async (transaction: Promise<TransactionResponse>) => {
  const tx = await transaction;
  console.log('Sending transaction', tx.hash, 'with', tx.from);
  await tx.wait();
  return tx.blockHash;
};
