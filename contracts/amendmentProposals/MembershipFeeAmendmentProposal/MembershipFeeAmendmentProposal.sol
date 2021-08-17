// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

import "../../Ownable/Ownable.sol";
import "../../CallerAuditable/CallerAuditable.sol";
import "../SettingAmendmentProposal/SettingAmendmentProposal.sol";

contract MembershipFeeAmendmentProposal is
    Ownable,
    CallerAuditable,
    SettingAmendmentProposal
{
    uint256 currentMembershipfee;

    modifier onlyOwnerOrAuthorizedCaller() {
        require(
            msg.sender == owner || authorizedCallers[msg.sender],
            "caller must be owner or authorized caller"
        );
        _;
    }

    // constructor setting owner and initial authorized caller address aka appAddress and current membership fee
    constructor(address _appContractAddress, uint256 _currentMembershipfee)
        Ownable()
    {
        authorizedCallers[_appContractAddress] = true;
        currentMembershipfee = _currentMembershipfee;
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

    // register a new membership amendment proposal
    function registerMembershipFeeAmendmentProposal(
        address _caller,
        uint256 _proposedValue,
        uint256 _voteWeight
    ) external onlyAuthorizedCaller {
        _registerProposal(_caller, _proposedValue, _voteWeight);
    }

    // vote an existing memebership fee amendment proposal
    function voteMembershipFeeAmendmentProposal(
        uint256 _proposalID,
        address _caller,
        bool _side,
        uint256 _voteWeight
    ) external onlyAuthorizedCaller {
        _voteProposal(_proposalID, _caller, _side, _voteWeight);
    }

    // activate an existing membership fee amendement proposal
    function activateMembershipFeeAmendmentProposal(uint256 _proposalID)
        external
        onlyAuthorizedCaller
    {
        _activateMembershipFeeAmendmentProposal(_proposalID);
        _setProposal(_proposalID, true);
    }

    // cehck wether a proposal is set
    function isMembershipFeeAmendmentProposalSet(uint256 _proposalID)
        external
        view
        onlyAuthorizedCaller
        returns (bool set)
    {
        return _isProposalSet(_proposalID);
    }

    // check wether a voter as already voted for a specific proposal
    function hasVotedMembershipFeeAmendmentProposal(
        address _caller,
        uint256 _proposalID
    ) external view onlyAuthorizedCaller returns (bool _hasVoted) {
        return _hasVotedProposal(_caller, _proposalID);
    }

    // fetch the current vote count for a membership fee amendment proposal
    function getVoteCountMembershipFeeAmendmentProposal(
        uint256 _proposalID,
        bool _side
    ) external view onlyAuthorizedCaller returns (uint256 count) {
        return _getVoteCountMembershipFeeAmendmentProposal(_proposalID, _side);
    }

    // fetch the current membership fee
    function getCurrentMembershipFee()
        external
        view
        onlyAuthorizedCaller
        returns (uint256 currentInsuranceCoverage)
    {
        return currentMembershipfee;
    }

    // fetch the membership proposal current proposal ID
    function getMembershipFeeAmendmentProposalCurrentProposalID()
        external
        view
        onlyAuthorizedCaller
        returns (uint256 currentProposalID)
    {
        return _getMembershipFeeAmendmentProposalCurrentProposalID();
    }

    // check weather a proposal has reached consensus
    function hasMembershipFeeAmendmentProposalReachedConsensus(
        uint256 _proposalID,
        bool _side,
        uint256 _consensusTreshold
    ) external view onlyAuthorizedCaller returns (bool) {
        return _hasReachedConsensus(_proposalID, _side, _consensusTreshold);
    }

    // fetch a proposal createdAt attribute referencing the block number
    function getProposalCreatedAt(uint256 _proposalID)
        external
        view
        returns (uint256 createdAt)
    {
        return _getProposalCreatedAt(_proposalID);
    }

    function _activateMembershipFeeAmendmentProposal(uint256 _proposalID)
        internal
    {
        Proposal memory _proposal = proposals[_proposalID];
        currentMembershipfee = _proposal.proposedValue;
    }

    function _getVoteCountMembershipFeeAmendmentProposal(
        uint256 _proposalID,
        bool _side
    ) internal view returns (uint256 count) {
        return _getVoteCount(_proposalID, _side);
    }

    function _getMembershipFeeAmendmentProposalCurrentProposalID()
        internal
        view
        returns (uint256 _currentProposalID)
    {
        return currentProposalID;
    }
}
