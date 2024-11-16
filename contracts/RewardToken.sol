// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardToken is ERC20, Ownable {

    /// @dev RewardToken is the name of the token
    /// @dev "RWD" is the token symbol
    constructor(address initialOwner) ERC20("RewardToken", "RWD") Ownable(initialOwner) {
    	require(initialOwner != address(0), "RewardToken: Invalid owner address");
    	 _transferOwnership(initialOwner);
    	 _transferOwnership(initialOwner);
    }

    /// @dev Mints tokens to a specified address
    /// @param to, is the address of the recipient who will receive the minted token
    /// @param amount, is the amount of tokens to be minted to the recipient
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}


