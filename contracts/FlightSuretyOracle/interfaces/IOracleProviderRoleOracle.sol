// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

interface IOracleProviderRoleOracle {
    /** caller authorization */

    // authorize a new caller to call the contract
    function authorizeCaller(address _caller) external;

    // remove an existing caller rights to call the contract
    function unauthorizeCaller(address _caller) external;

    /** oracle providers management (CHECK + ADD + REMOVE + VOTE) */

    // fetch current activated oracle provider count
    function getActivatedOracleProvidersCount()
        external
        view
        returns (uint256 count);

    // check if an oracle provider is activated
    function isActivatedOracleProvider(address _caller)
        external
        view
        returns (bool);

    // fetch oracle providers indexes
    function getOracleProviderIndexes(address _caller)
        external
        view
        returns (uint256[3] memory);
}
