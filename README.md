# Staking
## Overview
A smart contract that allows users to stake Ether for a specified period, applying a penalty for early unstaking. The contract owner can set a new penalty rate.

### stake
Allows a user to stake Ether by specifying an amount. The staked amount and timestamp are recorded in the user’s staking history.

### unstake
Allows the user to unstake a specific stake entry by its index. If the user unstakes before the minimumStakingPeriod, a penalty is deducted from the amount returned.

### setPenaltyRate
Allows the contract owner to update penaltyRate, this function can only be called by the owner.

### getUserStake
Returns the details of a user’s specific stake, including the amount staked and the timestamp.






