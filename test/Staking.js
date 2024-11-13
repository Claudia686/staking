const {
  expect
} = require("chai");
const {
  ethers
} = require("hardhat");

describe("Staking", () => {
  let staking, deployer, user;

  beforeEach(async () => {
    [deployer, user] = await ethers.getSigners();

    const Staking = await ethers.getContractFactory("Staking");
    staking = await Staking.deploy(deployer.address);
    await staking.waitForDeployment();
  })

  describe("Deployment", () => {
    // Checks for the owner
    it("Set the owner", async () => {
      expect(await staking.owner()).to.equal(deployer.address);
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

  describe("Staking", async () => {
    describe("Success", async () => {
      // Sets staked amount for staking
      const stakedAmount = ethers.parseUnits("2", "ether");
      let tx

      beforeEach(async () => {
        // Call stake function
        tx = await staking.connect(user).stake(stakedAmount, {
          value: stakedAmount
        });
        await tx.wait()
      })

      // User stakes
      it("Should let user stake", async () => {
        const [amount, timeStamp] = await staking.getUserStake(user.address, 0);
        expect(amount.toString()).to.equal(stakedAmount.toString());

        const block = await ethers.provider.getBlock(tx.blockNumber);
        expect(timeStamp).to.be.closeTo(block.timestamp, 2);
      })

      // Checks for multiple stakes 
      it("Should allow multiple stakes", async () => {
        const myAmount = ethers.parseUnits("2", "ether");

        // First stake
        const tx1 = await staking.connect(user).stake(myAmount, {
          value: myAmount
        });
        await tx1.wait();

        // Second stake
        const tx2 = await staking.connect(user).stake(myAmount, {
          value: myAmount
        });
        await tx2.wait();
        const userStakes = await staking.getUserStake(user.address, 0)
        expect(userStakes.length).to.equal(2);
      })
    })

    describe("Failure", async () => {
      // Rejects zero amount
      it("Revert insufficient ETH", async () => {
        const amount = ethers.parseUnits("0", "ether")
        await expect(staking.connect(user).stake(amount, {
            value: amount
          }))
          .to.be.revertedWith("Staking: Amount must be greater than zero")
      })
    })
  })
})