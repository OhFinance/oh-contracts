import {expect} from 'chai';
import {ManagementFixture, setupManagementTest} from 'fixture';
import {getNamedAccounts} from 'hardhat';

describe('OhLiquidator', () => {
  let fixture: ManagementFixture;

  before(async () => {
    fixture = await setupManagementTest();
  });

  it('is deployed correctly', async () => {
    const {deployer} = fixture;
    const {liquidator, registry} = deployer;
    const {uniswapV2, sushiswapV2, weth} = await getNamedAccounts();

    const registryAddress = await liquidator.registry();
    // const uniswap = await liquidator.uniswapRouter();
    // const sushiswap = await liquidator.sushiswapRouter();
    const wethAddress = await liquidator.weth();

    expect(registryAddress).eq(registry.address);
    // expect(uniswap).eq(uniswapV2);
    // expect(sushiswap).eq(sushiswapV2);
    expect(wethAddress).eq(weth);
  });

  it('added swap routes correctly', async () => {
    const {deployer} = fixture;
    const {liquidator} = deployer;
    const {aave, comp, crv, weth, usdc, sushiswapV2} = await getNamedAccounts();

    const aaveInfo = await liquidator.getSwapInfo(aave, usdc);
    const compInfo = await liquidator.getSwapInfo(comp, usdc);
    const crvInfo = await liquidator.getSwapInfo(crv, usdc);

    expect(sushiswapV2).eq(aaveInfo.router).eq(compInfo.router).eq(crvInfo.router);
    expect(3).eq(aaveInfo.path.length).eq(compInfo.path.length).eq(crvInfo.path.length);
    expect(weth).eq(aaveInfo.path[1]).eq(compInfo.path[1]).eq(crvInfo.path[1]);
  });

  it('was added to manager', async () => {
    const {deployer} = fixture;
    const {liquidator, manager} = deployer;
    const {aave, comp, crv, usdc} = await getNamedAccounts();

    const address1 = await manager.liquidators(aave, usdc);
    const address2 = await manager.liquidators(comp, usdc);
    const address3 = await manager.liquidators(crv, usdc);

    expect(liquidator.address).eq(address1).eq(address2).eq(address3);
  });
});
