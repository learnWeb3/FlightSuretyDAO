// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

contract FlightSuretyDataBase {
    struct Insurance {
        uint256 flightID;
        uint256 insuredValue;
        address owner;
        bool claimed;
    }

    struct Flight {
        string flightRef;
        uint64 estimatedDeparture;
        uint64 estimatedArrival;
        uint64 realDeparture;
        uint64 realArrival;
        bool isLate;
        address insuranceProvider;
        uint256 insuredValue;
        uint256 rate;
    }
    uint256 currentFlightID;
    mapping(uint256 => Flight) flights;
    uint256 currentInsuranceID;
    mapping(uint256 => Insurance) insurances;
    uint256 totalInsuredValue;
}
