// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

import "../libraries/Rolable.sol";
import "../libraries/Votable.sol";
import "../Ownable/Ownable.sol";
import "../CallerAuditable/CallerAuditable.sol";
import "../Random/Random.sol";

contract OracleProviderRole is Ownable, CallerAuditable, Random {
    using Rolable for Rolable.Role;
    Rolable.Role oracleProviders;
    using Votable for Votable.MembershipVote;
    Votable.MembershipVote oracleProvidersVote;
    mapping(address => uint256[3]) oracleProvidersIndexes;

    modifier onlyOwnerOrAuthorizedCaller() {
        require(
            msg.sender == owner || authorizedCallers[msg.sender],
            "caller must be owner or authorized caller"
        );
        _;
    }

    // constructor setting owner and initial authorized caller address aka appAddress
    constructor(address _appContractAddress, address _oracleContractAddress)
        Ownable()
    {
        authorizedCallers[_appContractAddress] = true;
        authorizedCallers[_oracleContractAddress] = true;
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

    /** oracle providers management (CHECK + ADD + REMOVE + VOTE) */

    // check if an oracle provider is registered
    function isRegisteredOracleProvider(address _caller)
        external
        view
        onlyAuthorizedCaller
        returns (bool)
    {
        return _isRegisteredOracleProvider(_caller);
    }

    // check if an oracle provider is activated
    function isActivatedOracleProvider(address _caller)
        external
        view
        onlyAuthorizedCaller
        returns (bool)
    {
        return _isActivatedOracleProvider(_caller);
    }

    // check if a given caller has voted for the membership of an other address
    function hasVotedOracleProviderMembership(address _account, address _caller)
        external
        view
        onlyAuthorizedCaller
        returns (bool)
    {
        return _hasVotedOracleProviderMembership(_account, _caller);
    }

    // check if an address currently voted for oracle provider membership has reached consensus among the community
    function hasReachedConsensusOracleProviderMembership(
        bool _side,
        address _caller,
        uint256 consensusTreshold
    ) external view onlyAuthorizedCaller returns (bool) {
        return
            oracleProvidersVote.hasReachedConsensusMembership(
                _side,
                _caller,
                consensusTreshold
            );
    }

    // fetch the oracle provider indexes
    function getOracleIndexes(address account)
        external
        view
        onlyAuthorizedCaller
        returns (
            uint256 index1,
            uint256 index2,
            uint256 index3
        )
    {
        uint256[3] memory _oracleProviderIndexes = oracleProvidersIndexes[
            account
        ];
        return (
            _oracleProviderIndexes[0],
            _oracleProviderIndexes[1],
            _oracleProviderIndexes[2]
        );
    }

    // get the current votes number for a given account
    function getOracleProviderMembershipCurrentMembershipVotes(
        bool _side,
        address _caller
    ) external view onlyAuthorizedCaller returns (uint256) {
        return oracleProvidersVote.getCurrentMembershipVotes(_caller, _side);
    }

    // fetch current registered oracle provider count
    function getRegisteredOracleProvidersCount()
        external
        view
        onlyAuthorizedCaller
        returns (uint256 count)
    {
        return _getRegisteredOracleProvidersCount();
    }

    // fetch current activated oracle provider count
    function getActivatedOracleProvidersCount()
        external
        view
        onlyAuthorizedCaller
        returns (uint256 count)
    {
        return _getActivatedOracleProvidersCount();
    }

    // register an oracle provider is registered
    function addOracleProvider(address _caller) external onlyAuthorizedCaller {
        _addOracleProvider(_caller);
    }

    // remove an existing oracle provider
    function renounceOracleProvider(address _account)
        external
        onlyAuthorizedCaller
    {
        _renounceOracleProvider(_account);
    }

    // vote for an oracle provider activation and membership
    function voteOracleProviderMembership(
        address _caller,
        address _account,
        uint256 _voteWeight
    ) external onlyAuthorizedCaller {
        oracleProvidersVote.voteMembership(
            _caller,
            true,
            _account,
            _voteWeight
        );
    }

    // activate an oracle provider
    function activateOracleProvider(address _account)
        external
        onlyAuthorizedCaller
    {
        _activateOracleProvider(_account);
    }

    // fetch oracle providers indexes
    function getOracleProviderIndexes(address _caller)
        external
        view
        onlyAuthorizedCaller
        returns (uint256[3] memory)
    {
        return oracleProvidersIndexes[_caller];
    }

    function _isRegisteredOracleProvider(address _caller)
        internal
        view
        returns (bool)
    {
        return oracleProviders.isRegistered(_caller);
    }

    function _isActivatedOracleProvider(address _caller)
        internal
        view
        returns (bool)
    {
        return oracleProviders.isActivated(_caller);
    }

    function _hasVotedOracleProviderMembership(
        address _account,
        address _caller
    ) internal view returns (bool) {
        return oracleProvidersVote.hasVotedMembership(_caller, _account);
    }

    function _getRegisteredOracleProvidersCount()
        internal
        view
        returns (uint256 count)
    {
        return oracleProviders.getRegisteredAccountsCount();
    }

    function _getActivatedOracleProvidersCount()
        internal
        view
        returns (uint256 count)
    {
        return oracleProviders.getActiveAccountsCount();
    }

    function _addOracleProvider(address _account) internal {
        oracleProviders.add(_account);
    }

    function _renounceOracleProvider(address _account) internal {
        oracleProviders.remove(_account);
    }

    function _setOracleIndexes(address _account) internal {
        uint256[3] memory _randomIndexes = _generateRandomIndexes();
        oracleProvidersIndexes[_account] = _randomIndexes;
    }

    function _activateOracleProvider(address _account) internal {
        oracleProviders.activate(_account);
        _setOracleIndexes(_account);
    }
}
