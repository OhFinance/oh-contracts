import { getDomain } from "./erc2612";

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
