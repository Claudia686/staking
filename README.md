# Staking
## Overview
A smart contract that allows users to stake Ether for a specified period, applying a penalty for early unstaking. The contract owner can set a new penalty rate.

### stake
Allows a user to stake Ether by specifying an amount. The staked amount and timestamp are recorded in the user’s staking history.

### unstake
Allows the user to unstake a specific stake entry by its index. If the user unstakes before the minimumStakingPeriod `(60 days)`, a penalty is deducted from the amount returned. Otherwise, the user receives one ERC20 token as a reward.

### setPenaltyRate
Allows the contract owner to update penaltyRate, this function can only be called by the owner.

### getUserStake
Returns the details of a user’s specific stake, including the amount staked and the timestamp.

---

# RewardToken
## Overview
The RewardToken contract is an ERC20 token used as a reward mechanism for stakers in the Staking contract. The owner can mint tokens to users.

### mint
Owner mint token to the user in staking contract

### Interaction Between Staking and RewardToken
The `RewardToken` contract allows the owner to mint tokens as rewards for users staking Ether in the `Staking` contract.








