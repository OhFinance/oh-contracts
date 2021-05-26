import {Signer} from 'ethers';
import {deployForum, deployGovernor, deployProxyAdmin} from 'lib';
import {getDecimalString} from 'utils';

export const deploy = async (deployer: Signer, registry: string, token: string) => {
  const forum = await deployForum(
    deployer,
    registry,
    token,
    1, // 1 block review
    17280, // 3 days (in blocks) voting
    getDecimalString(1000000) // 1m to propose
  );

  const governor = await deployGovernor(
    deployer,
    registry,
    forum.address,
    172800 // 2 days (in seconds)
  );

  // retain governance rights for initial deployment
  // await setGovernance(deployer, registry, governor.address);

  // *Consider for prod deployment:
  //    deploy proxy admin after governor is setup to avoid calling transferOwnership multiple times
  const proxyAdmin = await deployProxyAdmin(deployer, registry);

  return {
    forum,
    // manager,
    governor,
    proxyAdmin,
  };
};
