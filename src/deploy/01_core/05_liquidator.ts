import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {OhLiquidator, OhManager} from 'types';

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deployer, aave, comp, crv, weth, usdc, uniswapV2, sushiswapV2} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('5 - Liquidator');

  const registry = await ethers.getContract('OhRegistry');

  const result = await deploy('OhLiquidator', {
    from: deployer,
    args: [registry.address, uniswapV2, sushiswapV2],
    log: true,
    deterministicDeployment: false,
  });

  if (result.newlyDeployed) {
    log('Setting up Liquidator');
    const liquidator = (await ethers.getContract('OhLiquidator')) as OhLiquidator;
    await liquidator.setSushiswapRoutes(aave, usdc, [aave, weth, usdc]);
    await liquidator.setSushiswapRoutes(comp, usdc, [comp, weth, usdc]);
    await liquidator.setSushiswapRoutes(crv, usdc, [crv, weth, usdc]);

    log('Adding to Manager');
    const manager = (await ethers.getContract('OhManager')) as OhManager;
    await manager.setLiquidator(liquidator.address, aave, usdc);
    await manager.setLiquidator(liquidator.address, comp, usdc);
    await manager.setLiquidator(liquidator.address, crv, usdc);
  }
};

deploy.tags = ['OhLiquidator'];
deploy.dependencies = ['OhRegistry', 'OhManager'];
export default deploy;
