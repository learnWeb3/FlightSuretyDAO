// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

import "../Ownable/Ownable.sol";
import "../CallerAuditable/CallerAuditable.sol";
import "./ERC20.sol";

contract FlightSuretyShares is ERC20, Ownable, CallerAuditable {
    mapping(address => uint256) _tokenBase;
    modifier onlyOwnerOrAuthorizedCaller() {
        require(
            msg.sender == owner || authorizedCallers[msg.sender],
            "caller must be owner or authorized caller"
        );
        _;
    }

    // constructor setting owner and initial authorized caller address aka appAddress and making contract a special kind of ERC20
    constructor(address _appContractAddress)
        Ownable()
        ERC20("FlightSuretyShares", "FSS", 2500000)
    {
        authorizedCallers[_appContractAddress] = true;
    }

    // authorize a new caller to call the contract
    function authorizeCaller(address _caller)
        external
        onlyOwnerOrAuthorizedCaller
    {
        _authorizeCaller(_caller);
    }

    // remove an existing caller rights to call the contract
    function unauthorizeCaller(address _caller)
        external
        onlyOwnerOrAuthorizedCaller
    {
        _unauthorizeCaller(_caller);
    }

    // allow token minting on deposit of funds by orclae or insurance providers
    function mint(address account, uint256 amount)
        external
        onlyOwnerOrAuthorizedCaller
    {
        _mint(account, amount);
    }

    // allow token burning on ban of an account
    function burn(address account, uint256 amount)
        external
        onlyOwnerOrAuthorizedCaller
    {
        _burn(account, amount);
    }
}
