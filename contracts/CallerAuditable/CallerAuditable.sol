// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

contract CallerAuditable {
    mapping(address => bool) authorizedCallers;

    modifier onlyAuthorizedCaller() {
        require(authorizedCallers[msg.sender], "caller must be authorized");
        _;
    }

    function _authorizeCaller(address _account) internal {
        authorizedCallers[_account] = true;
    }

    function _unauthorizeCaller(address _account) internal {
        delete authorizedCallers[_account];
    }
}
