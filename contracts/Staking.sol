// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @dev imports from RewardToken contract, 
/// an ERC20 contract used for rewarding users
import "./RewardToken.sol";

contract Staking {
	RewardToken public rewardToken;
	address public owner;
	uint256 public minimumStakingPeriod = 60 days;  
	uint256 public penaltyRate = 10; 

    /// @notice tracks staked amount, and staked time for each address
    /// @notice tracks users balance 
	mapping(address => Stake[]) public userStakes;
	mapping(address => uint256) public balance;

    /// @notice emit Staked event with user address and amount
    /// @notice emit UnStaked event with address and amountToUnstake
	event Staked(address indexed user, uint256 amount);
	event UnStaked(address indexed, uint256 amountToUnstake);
    
    /// @param amount represent staked amount
    /// @param timeStamp represent time of staking 
	struct Stake {
		uint256 amount;
		uint256 timeStamp;
	}

	modifier onlyOwner() {
		require(msg.sender == owner, "Staking: Only owner can call this function");
		_;
	}

	/// @param _owner is the deployer address
	/// @param _rewardTokenAddress is the rewardToken address
	constructor(address _owner, address _rewardTokenAddress) {
		owner = _owner;  
		rewardToken = RewardToken(_rewardTokenAddress);
	}

	/// @dev penalty applies only if a user unstakes before the `minimumStakingPeriod 60 days`
	/// @dev user receive one ERC20 token if unstake after `minimumStakingPeriod 60 days`
    /// @notice checks for zero staked amount 
    /// @notice deduct penalty from staked amount
    /// @notice checks if minimum staking period has passed
    /// @notice reset user staked balance
    /// @notice transfer staked amount to the user
	function unstake(uint256 index) external {
		require(userStakes[msg.sender][index].amount > 0, "Staking: No staked amount");
		uint256 amountToUnstake = userStakes[msg.sender][index].amount;
		uint256 penaltyAmount = 0;

		if (block.timestamp < userStakes[msg.sender][index].timeStamp + minimumStakingPeriod) {
			penaltyAmount = (amountToUnstake * penaltyRate) /100;
			amountToUnstake -= penaltyAmount;
		 } else {
			rewardToken.mint(msg.sender, 1 ether);
		}

		balance[msg.sender] -= userStakes[msg.sender][index].amount;
		userStakes[msg.sender][index].amount = 0;
		(bool success, ) = msg.sender.call{value: amountToUnstake} ("");
		require(success, "Staking: Transfer failed");
		emit UnStaked( msg.sender, amountToUnstake);
	}

    /// @param _amount is the amount users want to stake
	/// @notice user should stake an amount that is greater than zero
    /// @notice amount, and timeStamp updates each time user stakes
    /// @notice update user's stake
    /// @notice returns amount staked
    /// @notice emit event for the user with their amount
	function stake(uint256 _amount) public payable {
		require(_amount > 0, "Staking: Amount must be greater than zero");
		userStakes[msg.sender].push(Stake({
			amount: _amount,
			timeStamp: block.timestamp
		}));

		balance[msg.sender] += _amount;
		emit Staked(msg.sender, _amount);
	}

	 /// @dev only owner can change penalty rate
	 /// @notice penalty rate must be between 1 and 100 
    function setPenaltyRate(uint256 newPenaltyRate) public onlyOwner {
    	require(newPenaltyRate <= 100, "Staking: Penalty rate must be between 1 and 100");
    	penaltyRate = newPenaltyRate;
    }
    
    /// @dev function returns amount and timeStamp
    /// @param amount represent staked amount
    /// @param timeStamp represent time of staking 
	function getUserStake(address _user, uint256 index) public view returns (
	    uint256 amount,
		uint256 timeStamp
	) {
		Stake memory userStake = userStakes[_user][index];
		return(userStake.amount, userStake.timeStamp);
	}
}
