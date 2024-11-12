// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Staking {
	address public owner;
	uint256 public minimumStakingPeriod = 60 days;  
	uint256 public penaltyRate = 10; 

    /// @notice tracks staked amount, and staked time for each address
    /// @notice tracks users balance 
	mapping(address => Stake[]) public userStakes;
	mapping(address => uint256) public balance;

    /// @notice emit Staked event with user address and amount
	event Staked(address indexed user, uint256 amount);
    
    /// @param amount represent staked amount
    /// @param timeStamp represent time of staking 
	struct Stake {
		uint256 amount;
		uint256 timeStamp;
	}

	/// @param _owner is the deployer address
	constructor(address _owner) {
		owner = _owner;  
	}

	modifier onlyOwner() {
		require(msg.sender == owner, "Staking: Only owner can call this function");
		_;
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
