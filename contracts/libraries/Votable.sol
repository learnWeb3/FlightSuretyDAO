// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

library Votable {
    struct MembershipVote {
        mapping(address => mapping(bool => uint256)) votes;
        mapping(address => mapping(address => bool)) voters;
    }

    struct ResultVote {
        mapping(bool => uint256) votes;
        mapping(address => bool) voters;
    }

    function hasVotedResult(ResultVote storage _vote, address _caller)
        internal
        view
        returns (bool)
    {
        if (_vote.voters[_caller]) {
            return true;
        } else {
            return false;
        }
    }

    function voteResult(
        ResultVote storage _vote,
        address _caller,
        bool _side,
         uint256 _voteWeight
    ) internal {
        _vote.votes[_side]+= _voteWeight;
        _vote.voters[_caller] = _side;
    }

    function hasReachedConsensusResult(
        ResultVote storage _vote,
        bool _side,
        uint256 _consensusTreshold
    ) internal view returns (bool) {
        if (_vote.votes[_side] >= _consensusTreshold) {
            return true;
        } else {
            return false;
        }
    }

    function hasVotedMembership(
        MembershipVote storage _vote,
        address _caller,
        address _account
    ) internal view returns (bool) {
        if (_vote.voters[_account][_caller]) {
            return true;
        } else {
            return false;
        }
    }

    function voteMembership(
        MembershipVote storage _vote,
        address _caller,
        bool _side,
        address _account,
        uint256 _voteWeight
    ) internal {
        _vote.votes[_account][_side] += _voteWeight;
        _vote.voters[_account][_caller] = _side;
    }

    function hasReachedConsensusMembership(
        MembershipVote storage _vote,
        bool _side,
        address _account,
        uint256 _consensusTreshold
    ) internal view returns (bool) {
        if (_vote.votes[_account][_side] >= _consensusTreshold) {
            return true;
        } else {
            return false;
        }
    }

    function getCurrentMembershipVotes(
        MembershipVote storage _vote,
        address _account,
        bool _side
    ) internal view returns (uint256) {
        return _vote.votes[_account][_side];
    }

    function getCurrentResultVotes(ResultVote storage _vote, bool _side)
        internal
        view
        returns (uint256)
    {
        return _vote.votes[_side];
    }
}
