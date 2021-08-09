// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

interface IFlightSuretyData {
    /** caller authorization */

    // authorize a new caller to call the contract
    function authorizeCaller(address _caller) external;

    // remove an existing caller rights to call the contract
    function unauthorizeCaller(address _caller) external;

    // flights  management
    // register a new flight for a given insurance provider aka airline
    function registerFlight(
        address _caller,
        string calldata _flightRef,
        uint64 _estimatedDeparture,
        uint64 _estimatedArrival,
        uint256 _rate
    ) external;

    // update flight data
    function updateFlight(
        uint256 _flightID,
        uint64 _realDeparture,
        uint64 _realArrival,
        bool _isLate
    ) external;

    // get current autoincrementing id of a given insurance provider aka airline
    function getCurrentFlightID()
        external
        view
        returns (uint256 insuranceProviderCurrentFlightID);

    /** insurance management */

    // insure a passenger for a given flight
    function insure(
        address _caller,
        uint256 _flightID,
        uint256 _insuredValue
    ) external;

    // set an insurance claimed attribute to true;
    function setInsuranceToClaimed(uint256 _insuranceID) external;

    // fetch the current autoincrementing ID of a given passenger
    function getCurrentInsuranceID()
        external
        view
        returns (uint256 currentInsuranceID);

    // fetch a passenger's insurance
    function getInsurance(uint256 _insuranceID)
        external
        view
        returns (
            uint256 flightID,
            uint256 insuredValue,
            address owner,
            bool claimed
        );

    // fetch a flight
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
            uint256 insuredValue,
            uint256 rate
        );

    // fetch the current total insured value
    function getTotalInsuredValue()
        external
        view
        returns (uint256 totalInsuredValue);

    // amend the total insured value
    function setTotalInsuredValue(uint256 totalInsuredValue) external;
}
