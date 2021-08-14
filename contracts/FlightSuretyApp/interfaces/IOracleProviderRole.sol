// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

interface IOracleProviderRole {
    /** caller authorization */

    // authorize a new caller to call the contract
    function authorizeCaller(address _caller) external;

    // remove an existing caller rights to call the contract
    function unauthorizeCaller(address _caller) external;

    /** oracle providers management (CHECK + ADD + REMOVE + VOTE) */

    // check if an oracle provider is registered
    function isRegisteredOracleProvider(address _caller)
        external
        view
        returns (bool);

    // check if an oracle provider is activated
    function isActivatedOracleProvider(address _caller) external view returns (bool);

    // check if a given caller has voted for the oracle provider membership of an other address
    function hasVotedOracleProviderMembership(address _account, address _caller)
        external
        view
        returns (bool);

    // check if an address currently voted for oracle provider membership has reached consensus among the community
    function hasReachedConsensusOracleProviderMembership(
        bool _side,
        address _caller,
        uint256 consensusTreshold
    ) external view returns (bool);

    // fetch current registered oracle provider count
    function getRegisteredOracleProvidersCount()
        external
        view
        returns (uint256 count);

    // fetch the oracle provider indexes
    function getOracleIndexes(address account)
        external
        view
        returns (
            uint256 index1,
            uint256 index2,
            uint256 index3
        );

    // fetch current activated oracle provider count
    function getActivatedOracleProvidersCount()
        external
        view
        returns (uint256 count);

    // register an oracle provider is registered
    function addOracleProvider(address _caller) external;

    // remove an existing oracle provider
    function renounceOracleProvider(address _caller, address _account) external;

    // vote for an oracle provider activation and membership
    function voteOracleProviderMembership(
        address _caller,
        address _account,
        uint256 _voteWeight
    ) external;

    // activate an oracle provider
    function activateOracleProvider(address _account) external;
}
