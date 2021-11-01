import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {OhLiquidator, OhManager} from 'types';

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deployer, aave, comp, crv, weth, usdc, uniswapV2, sushiswapV2} = await getNamedAccounts();
  const {deploy, execute, log} = deployments;

  // set the swap routes for tokens, use sushiswap
  const setSwapRoutes = async (from: string, to: string, path: string[]) => {
    await execute(
      'OhLiquidatorV2',
      {from: deployer, log: true},
      'setSwapRoutes',
      sushiswapV2,
      from,
      to,
      path
    );
  };

  const setLiquidator = async (liquidator: string, from: string, to: string) => {
    await execute('OhManager', {from: deployer, log: true}, 'setLiquidator', liquidator, from, to);
  };

  log('Core - Liquidator');

  const registry = await ethers.getContract('OhRegistry');
  const token = await ethers.getContract('OhToken');

  const result = await deploy('OhLiquidatorV2', {
    from: deployer,
    args: [registry.address, weth],
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: true,
  });

  if (result.newlyDeployed) {
    log('Setting up Liquidator');
    // set the routes for reward tokens
    await setSwapRoutes(aave, usdc, [aave, weth, usdc]);
    await setSwapRoutes(comp, usdc, [comp, weth, usdc]);
    await setSwapRoutes(crv, usdc, [crv, weth, usdc]);

    // set the routes for buyback
    await setSwapRoutes(usdc, token.address, [usdc, weth, token.address]);

    log('Adding to Manager');
    // set liquidator for reward tokens
    await setLiquidator(result.address, aave, usdc);
    await setLiquidator(result.address, comp, usdc);
    await setLiquidator(result.address, crv, usdc);

    // set liquidator for buyback
    await setLiquidator(result.address, usdc, token.address);
  }
};

deploy.tags = ['Core', 'OhLiquidator'];
deploy.dependencies = ['OhRegistry', 'OhManager'];
export default deploy;
