import {ethers} from 'hardhat';
import {addresses} from 'utils';
import OhAaveV2Strategy from 'abi/OhAaveV2Strategy.json';
import OhCompoundStrategy from 'abi/OhCompoundStrategy.json';
import OhCurve3PoolStrategy from 'abi/OhCurve3PoolStrategy.json';

export const getInitializeAaveV2StrategyData = (
  registry: string,
  bank: string,
  underlying: string,
  derivative: string
) => {
  const strategyInterface = new ethers.utils.Interface(OhAaveV2Strategy);
  const initializeData = strategyInterface.encodeFunctionData(
    'initializeAaveV2Strategy(address,address,address,address,address,address,address)',
    [
      registry,
      bank,
      underlying,
      derivative,
      addresses.aave, // this may need to be stkAave
      addresses.aaveLendingPool,
      addresses.aaveIncentivesController,
    ]
  );
  return initializeData;
};

export const getInitializeCompoundStrategyData = (
  registry: string,
  bank: string,
  underlying: string,
  derivative: string
) => {
  const strategyInterface = new ethers.utils.Interface(OhCompoundStrategy);
  const initializeData = strategyInterface.encodeFunctionData(
    'initializeCompoundStrategy(address,address,address,address,address,address)',
    [
      registry,
      bank,
      underlying,
      derivative,
      addresses.comp,
      addresses.compComptroller,
    ]
  );
  return initializeData;
};

export const getInitializeCurve3PoolStrategyData = (
  registry: string,
  bank: string,
  underlying: string,
  index: string
) => {
  const strategyInterface = new ethers.utils.Interface(OhCurve3PoolStrategy);
  const initializeData = strategyInterface.encodeFunctionData(
    'initializeCurve3PoolStrategy(address,address,address,address,address,address,address,address,uint256)',
    [
      registry,
      bank,
      underlying,
      addresses.crv3Token,
      addresses.crv,
      addresses.crv3Pool,
      addresses.crv3Gauge,
      addresses.crvMintr,
      index,
    ]
  );
  return initializeData;
};
