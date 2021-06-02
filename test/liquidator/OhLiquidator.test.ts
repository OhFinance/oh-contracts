import {expect} from 'chai';
import {managementFixture, ManagerFixture} from 'fixture';
import {addresses} from 'utils';

describe('OhLiquidator', () => {
  let fixture: ManagerFixture;

  before(async () => {
    fixture = await managementFixture();
  });

  it('is deployed correctly', async () => {
    const {liquidator} = fixture;

    const registry = await liquidator.registry();
    const uniswap = await liquidator.uniswapRouter();
    const sushiswap = await liquidator.sushiswapRouter();
    const weth = await liquidator.weth();

    expect(registry).eq(fixture.registry.address);
    expect(uniswap).eq(addresses.uniswapV2);
    expect(sushiswap).eq(addresses.sushiswapV2);
    expect(weth).eq(addresses.weth);
  });

  it('added swap routes correctly', async () => {
    const {liquidator} = fixture;

    const aaveInfo = await liquidator.getSwapInfo(addresses.aave, addresses.usdc);
    const compInfo = await liquidator.getSwapInfo(addresses.comp, addresses.usdc);
    const crvInfo = await liquidator.getSwapInfo(addresses.crv, addresses.usdc);

    expect(addresses.sushiswapV2).eq(aaveInfo.router).eq(compInfo.router).eq(crvInfo.router);
    expect(3).eq(aaveInfo.path.length).eq(compInfo.path.length).eq(crvInfo.path.length);
    expect(addresses.weth).eq(aaveInfo.path[1]).eq(compInfo.path[1]).eq(crvInfo.path[1]);
  });

  it('was added to manager', async () => {
    const {manager, liquidator} = fixture;

    const address1 = await manager.liquidators(addresses.aave, addresses.usdc);
    const address2 = await manager.liquidators(addresses.comp, addresses.usdc);
    const address3 = await manager.liquidators(addresses.crv, addresses.usdc);

    expect(liquidator.address).eq(address1).eq(address2).eq(address3);
  });
});
