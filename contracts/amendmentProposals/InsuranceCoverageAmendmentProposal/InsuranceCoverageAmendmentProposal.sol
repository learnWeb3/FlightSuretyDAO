// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

import "../../Ownable/Ownable.sol";
import "../../CallerAuditable/CallerAuditable.sol";
import "../SettingAmendmentProposal/SettingAmendmentProposal.sol";

contract InsuranceCoverageAmendmentProposal is
    Ownable,
    CallerAuditable,
    SettingAmendmentProposal
{
    uint256 currentInsuranceCoverage;

    modifier onlyOwnerOrAuthorizedCaller() {
        require(
            msg.sender == owner || authorizedCallers[msg.sender],
            "caller must be owner or authorized caller"
        );
        _;
    }

    // constructor setting owner and initial authorized caller address aka appAddress and current insurance coverage ratio
    constructor(address _appContractAddress, uint256 _currentInsuranceCoverage)
        Ownable()
    {
        authorizedCallers[_appContractAddress] = true;
        currentInsuranceCoverage = _currentInsuranceCoverage;
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

    // register a new insurance coverage ammendment proposal
    function registerInsuranceCoverageAmendmentProposal(
        address _caller,
        uint256 _proposedValue,
        uint256 _voteWeight
    ) external onlyAuthorizedCaller {
        _registerProposal(_caller, _proposedValue, _voteWeight);
    }

    // cehck wether a proposal is set
    function isInsuranceCoverageAmendmentProposalSet(uint256 _proposalID)
        external
        view
        onlyAuthorizedCaller
        returns (bool _set)
    {
        return _isProposalSet(_proposalID);
    }

    // vote an existing insurance coverage amendment proposal
    function voteInsuranceCoverageAmendmentProposal(
        uint256 _proposalID,
        address _caller,
        bool _side,
        uint256 _voteWeight
    ) external onlyAuthorizedCaller {
        _voteProposal(_proposalID, _caller, _side, _voteWeight);
    }

    // activate an existing insurance coverage amendment proposal
    function activateInsuranceCoverageAmendmentProposal(uint256 _proposalID)
        external
        onlyAuthorizedCaller
    {
        _activateInsuranceCoverageAmendmentProposal(_proposalID);
        _setProposal(_proposalID, true);
    }

    // check wether a voter as already voted for a specific proposal
    function hasVotedInsuranceCoverageAmendmentProposal(
        address _caller,
        uint256 _proposalID
    ) external view onlyAuthorizedCaller returns (bool _hasVoted) {
        return _hasVotedProposal(_caller, _proposalID);
    }

    // fetch the current vote count for an insurance coverage amendment proposal
    function getVoteCountInsuranceCoverageAmendmentProposal(
        uint256 _proposalID,
        bool _side
    ) external view onlyAuthorizedCaller returns (uint256 count) {
        return
            _getVoteCountInsuranceCoverageAmendmentProposal(_proposalID, _side);
    }

    // fetch the current insurance coverage
    function getCurrentInsuranceCoverage()
        external
        view
        onlyAuthorizedCaller
        returns (uint256 _currentInsuranceCoverage)
    {
        return currentInsuranceCoverage;
    }

    // check weather a proposal has reached consensus
    function hasInsuranceCoverageAmendmentProposalReachedConsensus(
        uint256 _proposalID,
        bool _side,
        uint256 _consensusTreshold
    ) external view onlyAuthorizedCaller returns (bool) {
        return _hasReachedConsensus(_proposalID, _side, _consensusTreshold);
    }

    // fetch the membership proposal current proposal ID
    function getInsuranceCoverageAmendmentCurrentProposalID()
        external
        view
        onlyAuthorizedCaller
        returns (uint256 currentProposalID)
    {
        return _getInsuranceCoverageAmendmentCurrentProposalID();
    }

    // fetch a proposal createdAt attribute referencing the block number
    function getProposalCreatedAt(uint256 _proposalID)
        external
        view
        returns (uint256 createdAt)
    {
        return _getProposalCreatedAt(_proposalID);
    }

    function _activateInsuranceCoverageAmendmentProposal(uint256 _proposalID)
        internal
    {
        Proposal memory _proposal = proposals[_proposalID];
        currentInsuranceCoverage = _proposal.proposedValue;
    }

    function _getVoteCountInsuranceCoverageAmendmentProposal(
        uint256 _proposalID,
        bool _side
    ) internal view returns (uint256 count) {
        return _getVoteCount(_proposalID, _side);
    }

    function _getInsuranceCoverageAmendmentCurrentProposalID()
        internal
        view
        returns (uint256 _currentProposalID)
    {
        return currentProposalID;
    }
}
