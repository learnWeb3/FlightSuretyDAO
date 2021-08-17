// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

interface IInsuranceCoverageAmendmentProposal {
    /** caller authorization */

    // authorize a new caller to call the contract
    function authorizeCaller(address _caller) external;

    // remove an existing caller rights to call the contract
    function unauthorizeCaller(address _caller) external;

    /** Settings amendment proposal */
    // register a new insurance coverga ammendment proposal
    function registerInsuranceCoverageAmendmentProposal(
        address _caller,
        uint256 _proposedValue,
        uint256 _voteWeight
    ) external;

    // vote an existing insurance coverage amendment proposal
    function voteInsuranceCoverageAmendmentProposal(
        uint256 _proposalID,
        address _caller,
        bool _side,
        uint256 _voteWeight
    ) external;

    // activate an existing insurance coverage amendment proposal
    function activateInsuranceCoverageAmendmentProposal(uint256 _proposalID)
        external;

    // cehck wether a proposal is set
    function isInsuranceCoverageAmendmentProposalSet(uint256 _proposalID)
        external
        view
        returns (bool set);

    // check wether a voter as already voted for a specific proposal
    function hasVotedInsuranceCoverageAmendmentProposal(
        address _caller,
        uint256 _proposalID
    ) external view returns (bool _hasVoted);

    // fetch the current vote count for an insurance coverage amendment proposal
    function getVoteCountInsuranceCoverageAmendmentProposal(
        uint256 _proposalID,
        bool _side
    ) external view returns (uint256 count);

    // fetch the insurance coverage current proposal ID
    function getInsuranceCoverageAmendmentCurrentProposalID()
        external
        view
        returns (uint256 currentProposalID);

    // check weather a proposal has reached consensus
    function hasInsuranceCoverageAmendmentProposalReachedConsensus(
        uint256 _proposalID,
        bool _side,
        uint256 _consensusTreshold
    ) external view returns (bool);

    // fetch the current insurance coverage
    function getCurrentInsuranceCoverage()
        external
        view
        returns (uint256 currentInsuranceCoverage);

    // fetch a proposal createdAt attribute referencing the block number
    function getProposalCreatedAt(uint256 _proposalID)
        external
        view
        returns (uint256 createdAt);
}
