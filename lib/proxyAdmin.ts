import { getProxyAdminContract } from "../lib"

export const upgradeProxy = async (
  deployer: string,
  proxyAdmin: string,
  proxy: string,
  implementation: string
) => {
  const proxyAdminContract = await getProxyAdminContract(deployer, proxyAdmin);
  const tx = await proxyAdminContract.upgrade(proxy, implementation);
  await tx.wait();
}