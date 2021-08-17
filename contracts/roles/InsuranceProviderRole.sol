// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

import "../libraries/Rolable.sol";
import "../libraries/Votable.sol";
import "../Ownable/Ownable.sol";
import "../CallerAuditable/CallerAuditable.sol";

contract InsuranceProviderRole is Ownable, CallerAuditable {
    using Rolable for Rolable.Role;
    Rolable.Role insuranceProviders;
    using Votable for Votable.MembershipVote;
    Votable.MembershipVote insuranceProvidersVote;
    mapping(address => uint256) insuranceProvidersFunding;

    modifier onlyOwnerOrAuthorizedCaller() {
        require(
            msg.sender == owner || authorizedCallers[msg.sender],
            "caller must be owner or authorized caller"
        );
        _;
    }

    // constructor setting owner and initial authorized caller address aka appAddress
    constructor(address _appContractAddress) Ownable() {
        authorizedCallers[_appContractAddress] = true;
    }

    /** caller authorization */

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

    /** insurance providers management (CHECK + ADD + REMOVE + VOTE) */

    // check if an insurance provider aka airline is registered
    function isRegisteredInsuranceProvider(address _caller)
        external
        view
        onlyAuthorizedCaller
        returns (bool)
    {
        return _isRegisteredInsuranceProvider(_caller);
    }

    // check if an insurance provider aka airline is activated
    function isActivatedInsuranceProvider(address _caller)
        external
        view
        onlyAuthorizedCaller
        returns (bool)
    {
        return _isActivatedInsuranceProvider(_caller);
    }

    // check if the caller has voted for insurance provider memebrship of an account
    function hasVotedInsuranceProviderMembership(
        address _account,
        address _caller
    ) external view onlyAuthorizedCaller returns (bool) {
        return _hasVotedInsuranceProviderMembership(_account, _caller);
    }

    // check if an address currently voted for insurance provider membership has reached consensus among the community
    function hasReachedConsensusInsuranceProviderMembership(
        bool _side,
        address _caller,
        uint256 consensusTreshold
    ) external view onlyAuthorizedCaller returns (bool) {
        return
            insuranceProvidersVote.hasReachedConsensusMembership(
                _side,
                _caller,
                consensusTreshold
            );
    }

    // get the current votes number for a given account
    function getInsuranceProviderMembershipCurrentMembershipVotes(
        bool _side,
        address _caller
    ) external view onlyAuthorizedCaller returns (uint256) {
        return insuranceProvidersVote.getCurrentMembershipVotes(_caller, _side);
    }

    // fetch current registered insurance provider count
    function getRegisteredInsuranceProvidersCount()
        external
        view
        onlyAuthorizedCaller
        returns (uint256 count)
    {
        return _getRegisteredInsuranceProvidersCount();
    }

    // fetch current activated insurance provider count
    function getActivatedInsuranceProvidersCount()
        external
        view
        onlyAuthorizedCaller
        returns (uint256 count)
    {
        return _getActivatedInsuranceProvidersCount();
    }

    // register an insurance provider aka airline
    function addInsuranceProvider(address _caller)
        external
        onlyAuthorizedCaller
    {
        _addInsuranceProvider(_caller);
    }

    // remove an insurance provider aka airline
    function renounceInsuranceProvider(address _account)
        external
        onlyAuthorizedCaller
    {
        _renounceInsuranceProvider(_account);
    }

    // vote for an insurance provider aka airline activation and membership
    function voteInsuranceProviderMembership(
        address _caller,
        address _account,
        uint256 _voteWeight
    ) external onlyAuthorizedCaller {
        insuranceProvidersVote.voteMembership(
            _caller,
            true,
            _account,
            _voteWeight
        );
    }

    // fund an insurance provider aka airline
    function fundInsuranceProvider(address _account, uint256 _amount)
        external
        onlyAuthorizedCaller
    {
        insuranceProvidersFunding[_account] = _amount;
    }

    // check if a given account is funded
    function isFundedInsuranceProvider(address _account)
        external
        view
        onlyAuthorizedCaller
        returns (bool isFunded)
    {
        if (insuranceProvidersFunding[_account] > 0) {
            return true;
        } else {
            return false;
        }
    }

    // activate an insurance provider aka airline
    function activateInsuranceProvider(address _account)
        external
        onlyAuthorizedCaller
    {
        _activateInsuranceProvider(_account);
    }

    function _isRegisteredInsuranceProvider(address _caller)
        internal
        view
        returns (bool)
    {
        return insuranceProviders.isRegistered(_caller);
    }

    function _isActivatedInsuranceProvider(address _caller)
        internal
        view
        returns (bool)
    {
        return insuranceProviders.isActivated(_caller);
    }

    function _hasVotedInsuranceProviderMembership(
        address _account,
        address _caller
    ) internal view returns (bool) {
        return insuranceProvidersVote.hasVotedMembership(_caller, _account);
    }

    function _getRegisteredInsuranceProvidersCount()
        internal
        view
        returns (uint256 count)
    {
        return insuranceProviders.getRegisteredAccountsCount();
    }

    function _getActivatedInsuranceProvidersCount()
        internal
        view
        returns (uint256 count)
    {
        return insuranceProviders.getActiveAccountsCount();
    }

    function _addInsuranceProvider(address _account) internal {
        insuranceProviders.add(_account);
    }

    function _renounceInsuranceProvider(address _account) internal {
        insuranceProviders.remove(_account);
    }

    function _activateInsuranceProvider(address _account) internal {
        insuranceProviders.activate(_account);
    }
}
