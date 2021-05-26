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

export const getDelegationMessageData = (
  token: string,
  delegator: string,
  delegatee: string,
  nonce: number,
  deadline: number
) => {
  const message = {
    delegator,
    delegatee,
    nonce,
    deadline,
  };

  const data = JSON.stringify({
    domain: getDomain('Oh! Finance', '1', token),
    message,
    primaryType: 'Delegation',
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
      Delegation: [
        {
          name: 'delegator',
          type: 'address',
        },
        {
          name: 'delegatee',
          type: 'address',
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
