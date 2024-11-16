const {
  expect
} = require("chai");
const {
  ethers
} = require("hardhat");

describe("Staking", () => {
  let staking, rewardToken, deployer, user;

  beforeEach(async () => {
    [deployer, user, initialOwner] = await ethers.getSigners();

    //Depoy rewardToken
    const RewardToken = await ethers.getContractFactory("RewardToken")
    rewardToken = await RewardToken.deploy(deployer.address)
    await rewardToken.waitForDeployment()

    // Deploy staking
    const Staking = await ethers.getContractFactory("Staking");
    staking = await Staking.deploy(deployer.address, rewardToken.target);
    await staking.waitForDeployment();
    await rewardToken.transferOwnership(staking.target)

  })

  describe("Deployment", () => {
    it("Set the owner and reward token", async () => {
      // Checks for the rewardToken
      expect(await staking.rewardToken()).to.equal(rewardToken.target);
      // Checks for staking owner
      expect(await staking.owner()).to.equal(deployer.address);
      // Checks for the rewardToken owner
      expect(await rewardToken.owner()).to.equal(staking.target);
    })

    // Checks for staking period
    it("Check for staking period", async () => {
      expect(await staking.minimumStakingPeriod()).to.equal(60 * 24 * 60 * 60);
    })

    // Checks for penalty rate
    it("Check for penalty rate", async () => {
      expect(await staking.penaltyRate()).to.equal(10);
    })
  })

  describe("Staking", () => {
    let stakedAmount, tx
    describe("Success", () => {
      beforeEach(async () => {
        // Sets staked amount for staking
        stakedAmount = ethers.parseUnits("2", "ether");

        // User stake 
        tx = await staking.connect(user).stake(stakedAmount, {
          value: stakedAmount
        });
        await tx.wait()
      })

      // User stake
      it("Should let user stake", async () => {
        const [amount, timeStamp] = await staking.getUserStake(user.address, 0);
        expect(amount.toString()).to.equal(stakedAmount.toString());

        const block = await ethers.provider.getBlock(tx.blockNumber);
        expect(timeStamp).to.be.closeTo(block.timestamp, 2);
      })

      // Checks for multiple stakes 
      it("Should allow multiple stakes", async () => {
        // First stake
        const tx1 = await staking.connect(user).stake(stakedAmount, {
          value: stakedAmount
        });
        await tx1.wait();

        // Second stake
        const tx2 = await staking.connect(user).stake(stakedAmount, {
          value: stakedAmount
        });
        await tx2.wait();

        const userStakes = await staking.getUserStake(user.address, 0)
        expect(userStakes.length).to.equal(2);
      })
    })

    describe("Failure", () => {
      // Rejects zero staked amount
      it("Revert insufficient staked ETH", async () => {
        const amount = ethers.parseUnits("0", "ether")
        await expect(staking.connect(user).stake(amount, {
            value: amount
          }))
          .to.be.revertedWith("Staking: Amount must be greater than zero")
      })
    })
  })

  describe("Unstaking", () => {
    let stakeAmount
    describe("Success", () => {
      beforeEach(async () => {
        // Set stake amount
        stakeAmount = ethers.parseUnits("5", "ether")
        // Stake
        const tx = await staking.connect(user).stake(stakeAmount, {
          value: stakeAmount
        })
        await tx.wait()
      })
      // Unstake after minimum period
      it("Unstakes without penalty after minimum period and mints token", async () => {
        // Retrive minimum staking period 
        const minimumStakingPeriod = (await staking.minimumStakingPeriod()).toString()
        await ethers.provider.send("evm_increaseTime", [minimumStakingPeriod + 1]);
        await ethers.provider.send("evm_mine");
        const amountAfterPenalty = stakeAmount

        // Check for user balance before minting
        const balanceBeforeMinting = await rewardToken.balanceOf(user.address)

        // Unstake and verify the event
        await expect(staking.connect(user).unstake(0))
          .to.emit(staking, "UnStaked")
          .withArgs(user.address, amountAfterPenalty);

        // Check for user balance after minting
        const balanceAfterMinting = await rewardToken.balanceOf(user.address)
        expect(balanceAfterMinting).to.be.greaterThan(balanceBeforeMinting);
      })

      // Apply penalty
      it("Applies 10% penalty if unstaked before minimum period", async () => {
        // Balance before unstake
        const balanceBefore = await ethers.provider.getBalance(user.address)

        // Set minimum staking period 
        const minimumStakingPeriod = (await staking.minimumStakingPeriod()).toString()
        const halfMinimumPeriodInSeconds = minimumStakingPeriod / 2

        // Increase minimum staking period
        await ethers.provider.send("evm_increaseTime", [halfMinimumPeriodInSeconds]);
        await ethers.provider.send("evm_mine");

        // Set penalty rate to 10%
        const penaltyRate = 10n
        const penaltyAmount = (stakeAmount * penaltyRate) / 100n
        const amountAfterPenalty = stakeAmount - penaltyAmount;

        // Unstake
        const tx = await staking.connect(user).unstake(0)
        await tx.wait()

        // Expected balance after applying 10% penalty
        const balanceAfterPenalty = balanceBefore - penaltyAmount;
        expect(balanceAfterPenalty).to.be.lessThan(balanceBefore)
      })
    })

    describe("Failure", () => {
      // Revert if already unstaked
      it("Revert if user already unstaked", async () => {
        const tx = await staking.connect(user).stake(stakeAmount, {
          value: stakeAmount
        })
        const tx1 = await staking.connect(user).unstake(0)
        await expect(staking.connect(user).unstake(0))
          .to.be.revertedWith("Staking: No staked amount");
      })
    })
  })

  describe("Set penalty rate", () => {
    let newPenaltyRate
    describe("Success", () => {
      beforeEach(async () => {
        newPenaltyRate = 5
      })

      // Deployer change penalty rate to 5
      it("Should allow owner to change the penalty rate", async () => {
        await staking.connect(deployer).setPenaltyRate(newPenaltyRate)
      })
    })

    describe("Failure", () => {
      // Deployer change penalty rate above 100
      it("Reverts if penalty rate is above 100", async () => {
        const invalidPenaltyRate = 101
        await expect(staking.connect(deployer).setPenaltyRate(invalidPenaltyRate))
          .to.be.revertedWith("Staking: Penalty rate must be between 1 and 100");
      })

      // Rejects non-owner trying to set penalty rate
      it("Reverts when a non-owner attempts to set the penalty rate", async () => {
        await expect(staking.connect(user).setPenaltyRate(newPenaltyRate))
          .to.be.revertedWith("Staking: Only owner can call this function");
      })
    })
  })
})