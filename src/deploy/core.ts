import {Signer} from 'ethers'
import {deployRegistry, deployToken} from 'lib'
import {execute} from 'utils'

export const deploy = async (deployer: Signer) => {
  const registry = await deployRegistry(deployer)
  const token = await deployToken(deployer, registry.address)

  // self-delegate to kick off proposals later
  // const address = await deployer.getAddress();
  // await execute(token.delegate(address));

  return {
    registry,
    token,
  }
}
