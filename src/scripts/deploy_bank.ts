import {ethers} from 'hardhat';
import {deployContract} from 'utils';

const main = async () => {
  const [deployer] = await ethers.getSigners();
};

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    return process.exit(1);
  });
