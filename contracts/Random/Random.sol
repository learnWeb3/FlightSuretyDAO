// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

contract Random {
    uint256 nonce;

    // pseudo random function based on the current block timestamp and an autoincrementing number
    function _rand(uint256 maxBound) internal returns (uint256) {
        if (nonce >= 100) {
            nonce = 0;
        }
        return
            uint256(keccak256(abi.encodePacked(block.timestamp + nonce++))) %
            maxBound;
    }

    function _generateRandomIndexes() internal returns (uint256[3] memory) {
        uint256 rand1;
        uint256 rand2;
        uint256 rand3;
        rand1 = _rand(5);
        rand2 = _rand(5);
        while (rand2 == rand1) {
            rand2 = _rand(5);
        }
        rand3 = _rand(5);
        while (rand3 == rand2 || rand3 == rand1) {
            rand3 = _rand(5);
        }

        return [rand1, rand2, rand3];
    }
}
