import {network} from 'hardhat';

export const getDomain = (name: string, version: string, token: string) => ({
  name,
  version,
  chainId: network.config.chainId,
  verifyingContract: token,
});

export const getPermitMessageData = (
  name: string,
  version: string,
  token: string,
  owner: string,
  spender: string,
  value: string,
  nonce: number,
  deadline: number
) => {
  const message = {
    owner,
    spender,
    value,
    nonce,
    deadline,
  };

  const data = JSON.stringify({
    domain: getDomain(name, version, token),
    message,
    primaryType: 'Permit',
    types: {
      EIP712Domain: [
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'version',
          type: 'string',
        },
        {
          name: 'chainId',
          type: 'uint256',
        },
        {
          name: 'verifyingContract',
          type: 'address',
        },
      ],
      Permit: [
        {
          name: 'owner',
          type: 'address',
        },
        {
          name: 'spender',
          type: 'address',
        },
        {
          name: 'value',
          type: 'uint256',
        },
        {
          name: 'nonce',
          type: 'uint256',
        },
        {
          name: 'deadline',
          type: 'uint256',
        },
      ],
    },
  });

  return {
    message,
    data,
  };
};