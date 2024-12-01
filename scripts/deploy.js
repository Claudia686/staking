const hre = require("hardhat");

async function main() {
	// Setup account
	const [owner] = await ethers.getSigners();
	const name = "RewardToken";
	const symbol = "RWD";

	// Deploy rewardToken
	const RewardToken = await ethers.getContractFactory("RewardToken");
	rewardToken = await RewardToken.deploy(owner.address);
	await rewardToken.waitForDeployment();
	console.log(`rewardToken contract deployed at: ${await rewardToken.getAddress()}`);

	// Deploy staking
	const [deployer] = await ethers.getSigners();
	const Staking = await ethers.getContractFactory("Staking");
	staking = await Staking.deploy(deployer.address, rewardToken.target);
	await staking.waitForDeployment();
	console.log(`staking contract deployed at: ${await staking.getAddress()}`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});