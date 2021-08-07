// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

interface OracleProviderRole {
    /** caller authorization */

    // authorize a new caller to call the contract
    function authorizeCaller(address _caller) external;

    // remove an existing caller rights to call the contract
    function unauthorizeCaller(address _caller) external;

    /** oracle providers management (CHECK + ADD + REMOVE + VOTE) */

    // check if an oracle provider is activated
    function isActivatedOracleProvider(address _caller) external returns (bool);
}
