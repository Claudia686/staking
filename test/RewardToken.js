const {
	expect
} = require("chai");
const {
	ethers
} = require("hardhat");

const name = "RewardToken"
const symbol = "RWD"

describe("RewardToken", () => {
	let rewardToken, owner, user

	beforeEach(async () => {
		[owner, user] = await ethers.getSigners()

		// Deploy rewardToken
		const RewardToken = await ethers.getContractFactory("RewardToken")
		rewardToken = await RewardToken.deploy(owner.address)
		await rewardToken.waitForDeployment()
	})

	describe("Deployment", () => {
		// Check for owner
		it("It has a owner", async () => {
			expect(await rewardToken.owner()).to.equal(owner.address);
		})

		// Check for name
		it("It has a name", async () => {
			expect(await rewardToken.name()).to.equal(name);
		})

		// Check for symbol
		it("It has a symbol", async () => {
			expect(await rewardToken.symbol()).to.equal(symbol);
		})
	})

	describe("Minting", () => {
		describe("Success", () => {
			// Mint a token
			it("Should mint a token to the user", async () => {
				const toAddress = user.address
				const amount = await ethers.parseEther("1", "ether")
				const tx = await rewardToken.connect(owner).mint(toAddress, amount)
				await tx.wait()
			})
		})

		describe("Failure", () => {
			// Revert non-owner from mint
			it("Revert non-owner minting a token", async () => {
				const toAddress = user.address
				const amount = await ethers.parseEther("1", "ether")
				await expect(rewardToken.connect(user).mint(toAddress, amount))
				.to.be.reverted;
			})
		})
	})
})