// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

interface IInsuranceProviderRole {
    /** caller authorization */

    // authorize a new caller to call the contract
    function authorizeCaller(address _caller) external;

    // remove an existing caller rights to call the contract
    function unauthorizeCaller(address _caller) external;

    /** insurance providers management (CHECK + ADD + REMOVE + VOTE) */

    // check if an insurance provider aka airline is registered
    function isRegisteredInsuranceProvider(address _caller)
        external
        view
        returns (bool);

    // check if an insurance provider aka airline is funded
    function isFundedInsuranceProvider(address _account)
        external
        view
        returns (bool);

    // check if an insurance provider aka airline is activated
    function isActivatedInsuranceProvider(address _caller)
        external
        view
        returns (bool);

    // check if a given caller has voted for the insurance provider membership of an other address
    function hasVotedInsuranceProviderMembership(
        address _account,
        address _caller
    ) external view returns (bool);

    // check if an address currently voted for insurance provider membership has reached consensus among the community
    function hasReachedConsensusInsuranceProviderMembership(
        bool _side,
        address _caller,
        uint256 consensusTreshold
    ) external view returns (bool);

    // fetch current registered insurance provider count
    function getRegisteredInsuranceProvidersCount()
        external
        view
        returns (uint256 count);

    // fetch current activated insurance provider count
    function getActivatedInsuranceProvidersCount()
        external
        view
        returns (uint256 count);

    // register an insurance provider aka airline
    function addInsuranceProvider(address _caller) external;

    // remove an insurance provider aka airline
    function renounceInsuranceProvider(address _caller, address _account)
        external;

    // vote for an insurance provider aka airline activation and membership
    function voteInsuranceProviderMembership(
        address _caller,
        address _account,
        uint256 _voteWeight
    ) external;

    // fund an insurance provider aka airline
    function fundInsuranceProvider(address _account, uint256 _amount) external;

    // activate an insurance provider aka airline
    function activateInsuranceProvider(address _account) external;
}
