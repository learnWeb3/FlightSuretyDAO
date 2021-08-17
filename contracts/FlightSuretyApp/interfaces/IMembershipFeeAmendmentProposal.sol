// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

interface IMembershipFeeAmendmentProposal {
    /** caller authorization */

    // authorize a new caller to call the contract
    function authorizeCaller(address _caller) external;

    // remove an existing caller rights to call the contract
    function unauthorizeCaller(address _caller) external;

    // register a new membership amendment proposal
    function registerMembershipFeeAmendmentProposal(
        address _caller,
        uint256 _proposedValue,
        uint256 _voteWeight
    ) external;

    // vote an existing memebership fee amendment proposal
    function voteMembershipFeeAmendmentProposal(
        uint256 _proposalID,
        address _caller,
        bool _side,
        uint256 _voteWeight
    ) external;

    // activate an existing membership fee amendement proposal
    function activateMembershipFeeAmendmentProposal(uint256 _proposalID)
        external;

    // cehck wether a proposal is set
    function isMembershipFeeAmendmentProposalSet(uint256 _proposalID)
        external
        view
        returns (bool set);

    // check wether a voter as already voted for a specific proposal
    function hasVotedMembershipFeeAmendmentProposal(
        address _caller,
        uint256 _proposalID
    ) external view returns (bool _hasVoted);

    // fetch the current vote count for a membership fee amendment proposal
    function getVoteCountMembershipFeeAmendmentProposal(
        uint256 _proposalID,
        bool _side
    ) external view returns (uint256 count);

    // fetch the current membership amendment proposal ID
    function getMembershipFeeAmendmentProposalCurrentProposalID()
        external
        view
        returns (uint256 currentProposalID);

    // check weather a proposal has reached consensus
    function hasMembershipFeeAmendmentProposalReachedConsensus(
        uint256 _proposalID,
        bool _side,
        uint256 _consensusTreshold
    ) external view returns (bool);

    // fetch the current membership fee
    function getCurrentMembershipFee()
        external
        view
        returns (uint256 currentInsuranceCoverage);

    // fetch a proposal createdAt attribute referencing the block number
    function getProposalCreatedAt(uint256 _proposalID)
        external
        view
        returns (uint256 createdAt);
}
