// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

import "../../libraries/Votable.sol";

contract SettingAmendmentProposal {
    using Votable for Votable.ResultVote;
    struct Proposal {
        uint256 proposedValue;
        uint256 createdAt;
    }
    uint256 currentProposalID;
    mapping(uint256 => Votable.ResultVote) proposalVotes;
    mapping(uint256 => Proposal) proposals;

    function _registerProposal(address _caller, uint256 _proposedValue,  uint256 _voteWeight)
        internal
    {
        Proposal memory _proposal = Proposal({
            proposedValue: _proposedValue,
            createdAt: block.timestamp
        });

        currentProposalID++;
        proposals[currentProposalID] = _proposal;
        _voteProposal(currentProposalID, _caller, true, _voteWeight);
    }

    function _voteProposal(
        uint256 _proposalID,
        address _caller,
        bool _side,
        uint256 _voteWeight
    ) internal {
        proposalVotes[_proposalID].voteResult(_caller, _side,  _voteWeight);
    }

    function _getVoteCount(uint256 _proposalID, bool _side)
        internal
        view
        returns (uint256 count)
    {
        return proposalVotes[_proposalID].getCurrentResultVotes(_side);
    }

    function _getCurrentProposalID()
        internal
        view
        returns (uint256 _currentProposalID)
    {
        return currentProposalID;
    }

    function _hasReachedConsensus(
        uint256 _proposalID,
        bool _side,
        uint256 consensusTreshold
    ) internal view returns (bool) {
        return
            proposalVotes[_proposalID].hasReachedConsensusResult(
                _side,
                consensusTreshold
            );
    }
}
