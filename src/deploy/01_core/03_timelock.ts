import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';

// time periods in seconds
const ONE_MONTH = 2592000; // 30 days
const FIVE_MONTHS = 12960000; // 150 days
const EIGHT_MONTHS = 20736000; // 240 days
const ONE_YEAR = 31104000; // 360 days
const FOUR_YEARS = 124416000; // 1440 days

// deploy the vesting contracts
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts, network, run} = hre;
  const {deployer} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('3 - Timelock');

  const registry = await ethers.getContract('OhRegistry');
  const token = await ethers.getContract('OhToken');

  const timelocks = [
    {
      name: 'Vesting',
      vest: EIGHT_MONTHS,
    },
    {
      name: 'Foundation',
      vest: FOUR_YEARS,
    },
    {
      name: 'Growth',
      vest: ONE_YEAR,
    },
    {
      name: 'Legal',
      vest: FIVE_MONTHS,
    },
  ];

  for (let timelock of timelocks) {
    log(`${timelock.name} Timelock`);

    const constructorArguments = [
      registry.address,
      token.address,
      ONE_MONTH, // all 1 month cliff
      timelock.vest, // vest from different schedule
    ];

    const result = await deploy(`Oh${timelock.name}Timelock`, {
      from: deployer,
      contract: 'OhTimelock',
      args: constructorArguments,
      log: true,
      deterministicDeployment: false,
      skipIfAlreadyDeployed: false,
    });
  }

  return hre.network.live;
};

deploy.id = '1';
deploy.tags = ['OhTimelock'];
deploy.dependencies = ['OhRegistry', 'OhToken'];
export default deploy;
