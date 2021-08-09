// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

interface IFlightSuretyOracle {
    /** caller authorization */

    // authorize a new caller to call the contract
    function authorizeCaller(address _caller) external;

    // remove an existing caller rights to call the contract
    function unauthorizeCaller(address _caller) external;

    

}
