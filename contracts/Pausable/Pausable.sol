// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

contract Pausable {
    bool operationnal;

    constructor() {
        operationnal = true;
    }

    modifier onlyOperational() {
        require(operationnal, "contract must be operationnal");
        _;
    }

    function _setOperationnal(bool _operationnal) internal {
        operationnal = _operationnal;
    }
}
