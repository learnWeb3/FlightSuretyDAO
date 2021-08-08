// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

interface IFlightSuretyDataOracle {
    function updateFlight(
        uint256 _flightID,
        uint64 _realDeparture,
        uint64 _realArrival,
        bool _isLate
    ) external;

    function setTotalInsuredValue(uint256 _totalInsuredValue) external;

    function getTotalInsuredValue()
        external
        view
        returns (uint256 totalInsuredValue);

    function getFlight(uint256 _flightID)
        external
        view
        returns (
            string memory flightRef,
            uint64 estimatedDeparture,
            uint64 estimatedArrival,
            uint64 realDeparture,
            uint64 realArrival,
            bool isLate,
            address insuranceProvider,
            uint256 insuredValue
        );
}
