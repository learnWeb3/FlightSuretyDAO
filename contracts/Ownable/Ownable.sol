// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

contract Ownable {
    address owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "caller must be owner");
        _;
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        owner = _newOwner;
    }

    function destructContract() external onlyOwner {
        selfdestruct(payable(owner));
    }

    function isOwner() external view returns(bool _isOwner){
        return msg.sender == owner;
    }
}
