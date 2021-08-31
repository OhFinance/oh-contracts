import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {OhLiquidator, OhManager} from 'types';

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deployer, aave, comp, crv, weth, usdc, uniswapV2, sushiswapV2} = await getNamedAccounts();
  const {deploy, execute, log} = deployments;

  const setSushiswapRoutes = async (from: string, to: string, path: string[]) => {
    await execute(
      'OhLiquidator',
      {from: deployer, log: true},
      'setSushiswapRoutes',
      from,
      to,
      path
    );
  };

  const setLiquidator = async (liquidator: string, from: string, to: string) => {
    await execute('OhManager', {from: deployer, log: true}, 'setLiquidator', liquidator, from, to);
  };

  log('5 - Liquidator');

  const registry = await ethers.getContract('OhRegistry');
  const liquidator = (await ethers.getContract('OhLiquidator')) as OhLiquidator;

  const result = await deploy('OhLiquidator', {
    from: deployer,
    args: [registry.address, uniswapV2, sushiswapV2],
    log: true,
    deterministicDeployment: false,
  });

  if (result.newlyDeployed) {
    log('Setting up Liquidator');
    await setSushiswapRoutes(aave, usdc, [aave, weth, usdc]);
    await setSushiswapRoutes(comp, usdc, [comp, weth, usdc]);
    await setSushiswapRoutes(crv, usdc, [crv, weth, usdc]);

    log('Adding to Manager');
    await setLiquidator(liquidator.address, aave, usdc);
    await setLiquidator(liquidator.address, comp, usdc);
    await setLiquidator(liquidator.address, crv, usdc);
  }
};

deploy.tags = ['OhLiquidator'];
deploy.dependencies = ['OhRegistry', 'OhManager'];
export default deploy;
