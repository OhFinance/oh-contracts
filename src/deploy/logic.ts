import {Signer} from 'ethers';
import {
  deployAaveV2Strategy,
  deployBank,
  deployCompoundStrategy,
  deployCurve3PoolStrategy,
} from 'lib';

// deploy the bank and strategy logic contracts
export const deploy = async (deployer: Signer, registry: string) => {
  // deploy the bank logic contract
  const bankLogic = await deployBank(deployer);

  // deploy the initial strategy logic contracts
  const aaveV2StrategyLogic = await deployAaveV2Strategy(deployer);
  const compoundStrategyLogic = await deployCompoundStrategy(deployer);
  const curve3PoolStrategyLogic = await deployCurve3PoolStrategy(deployer);

  return {
    bankLogic,
    aaveV2StrategyLogic,
    compoundStrategyLogic,
    curve3PoolStrategyLogic,
  };
};
