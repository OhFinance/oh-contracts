import { BigNumberish } from "@ethersproject/bignumber";
import { ethers } from "hardhat";
import { getERC20Contract } from "./contract";

export const approve = async (signer: string, token: string, spender: string, amount?: BigNumberish) => {
  const tokenContract = await getERC20Contract(signer, token)
  const tx = await tokenContract.approve(spender, amount ?? ethers.constants.MaxUint256.toString());
  await tx.wait();
}