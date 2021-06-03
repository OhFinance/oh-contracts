import {ethers, getNamedAccounts} from 'hardhat';
import OhAaveV2Strategy from 'abi/OhAaveV2Strategy.json';
import OhCompoundStrategy from 'abi/OhCompoundStrategy.json';
import OhCurve3PoolStrategy from 'abi/OhCurve3PoolStrategy.json';

export const getInitializeAaveV2StrategyData = async (registry: string, bank: string, underlying: string, derivative: string) => {
  const {aave, aaveStakedToken, aaveLendingPool, aaveIncentivesController} = await getNamedAccounts();
  const strategyInterface = new ethers.utils.Interface(OhAaveV2Strategy);
  const initializeData = strategyInterface.encodeFunctionData(
    'initializeAaveV2Strategy(address,address,address,address,address,address,address,address)',
    [registry, bank, underlying, derivative, aave, aaveStakedToken, aaveLendingPool, aaveIncentivesController]
  );
  return initializeData;
};

export const getInitializeCompoundStrategyData = async (registry: string, bank: string, underlying: string, derivative: string) => {
  const {comp, compComptroller} = await getNamedAccounts();
  const strategyInterface = new ethers.utils.Interface(OhCompoundStrategy);
  const initializeData = strategyInterface.encodeFunctionData(
    'initializeCompoundStrategy(address,address,address,address,address,address)',
    [registry, bank, underlying, derivative, comp, compComptroller]
  );
  return initializeData;
};

export const getInitializeCurve3PoolStrategyData = async (registry: string, bank: string, underlying: string, index: string) => {
  const {crv, crv3Token, crv3Pool, crv3Gauge, crvMintr} = await getNamedAccounts();
  const strategyInterface = new ethers.utils.Interface(OhCurve3PoolStrategy);
  const initializeData = strategyInterface.encodeFunctionData(
    'initializeCurve3PoolStrategy(address,address,address,address,address,address,address,address,uint256)',
    [registry, bank, underlying, crv3Token, crv, crv3Pool, crv3Gauge, crvMintr, index]
  );
  return initializeData;
};
