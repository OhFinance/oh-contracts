import {network} from 'hardhat';

export const signMessageData = async (from: string, data: any) => {
  const result = (await network.provider.request({
    method: 'eth_signTypedData_v4',
    params: [from, data],
  })) as string;

  return {
    v: Number('0x' + result.slice(130, 132)),
    r: result.slice(0, 66),
    s: '0x' + result.slice(66, 130),
  };
};
