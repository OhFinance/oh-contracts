import {ethers, getNamedAccounts} from 'hardhat';
import {OhForum, OhManager} from 'types';

const TO_PAUSE = '0x0000';

async function run() {
  try {
    const {deployer} = await getNamedAccounts();

    const forum = (await ethers.getContract('OhForum', deployer)) as OhForum;
    await forum.acceptAdmin();

    const manager = (await ethers.getContract('OhManager', deployer)) as OhManager;
    // await manager.pause(TO_PAUSE);
  } catch (err) {
    console.error(err);
    return process.exit(1);
  }
}

run();
