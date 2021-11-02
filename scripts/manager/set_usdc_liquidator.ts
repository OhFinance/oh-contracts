import {getNamedAccounts} from 'hardhat';
import {getLiquidatorContract, getManagerContract, getTokenContract} from 'utils';

async function run() {
  try {
    const {deployer, aave, comp, crv, usdc} = await getNamedAccounts();

    const manager = await getManagerContract(deployer);
    const liquidator = await getLiquidatorContract(deployer);
    const token = await getTokenContract(deployer);

    // rewards
    await manager.setLiquidator(liquidator.address, aave, usdc);
    await manager.setLiquidator(liquidator.address, comp, usdc);
    await manager.setLiquidator(liquidator.address, crv, usdc);

    // buyback
    await manager.setLiquidator(liquidator.address, usdc, token.address);
  } catch (err) {
    console.error(err);
    return process.exit(1);
  }
}

run();
