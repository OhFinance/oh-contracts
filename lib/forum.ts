import {ethers} from 'hardhat';
import {getForumAt} from './contract';
import OhManager from '../abi/OhManager.json';
import {getFunctionData, getFunctionName, getFunctionSignature} from '../utils';

export const addBankAndStrategiesProposal = async (
  proposer: string,
  forum: string,
  manager: string,
  bank: string,
  strategies: string[],
  description: string
) => {
  const forumContract = await getForumAt(forum, proposer);

  const managerInterface = new ethers.utils.Interface(OhManager);
  const setBankFunc = getFunctionName(managerInterface, 'setBank');
  const addStrategyFunc = getFunctionName(managerInterface, 'addStrategy');

  // const setBankSignature = getFunctionSignature(managerInterface, setBankFunc);
  // const addStrategySignature = getFunctionSignature(
  //   managerInterface,
  //   addStrategyFunc
  // );

  const setBankData = getFunctionData(managerInterface, setBankFunc, [bank, true]);

  const targets = Array(strategies.length + 1).fill(manager);
  const values = Array(strategies.length + 1).fill(0);

  const signatures = Array(strategies.length + 1).fill(addStrategyFunc);
  signatures[0] = setBankFunc;

  const data = [];
  data.push(setBankData);
  for (let strategy of strategies) {
    const addStrategyData = getFunctionData(managerInterface, addStrategyFunc, [bank, strategy]);
    data.push(addStrategyData);
  }

  await forumContract.propose(targets, values, signatures, data, description);
};
