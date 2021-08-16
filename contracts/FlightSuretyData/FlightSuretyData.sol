// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

import "../Ownable/Ownable.sol";
import "../CallerAuditable/CallerAuditable.sol";
import "./FlightSuretyDataBase.sol";

contract FlightSuretyData is Ownable, CallerAuditable, FlightSuretyDataBase {
    modifier onlyOwnerOrAuthorizedCaller() {
        require(
            msg.sender == owner || authorizedCallers[msg.sender],
            "caller must be owner or authorized caller"
        );
        _;
    }

    // constructor setting owner and initial authorized caller address aka appAddress and oracle contract address
    constructor(address _appContractAddress, address _oracleContractAddress)
        Ownable()
    {
        authorizedCallers[_appContractAddress] = true;
        authorizedCallers[_oracleContractAddress] = true;
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

    // flights  management
    // register a new flight for a given insurance provider aka airline
    function registerFlight(
        address _caller,
        string calldata _flightRef,
        uint64 _estimatedDeparture,
        uint64 _estimatedArrival,
        uint256 _rate
    ) external onlyAuthorizedCaller {
        Flight memory _flight = Flight({
            flightRef: _flightRef,
            estimatedDeparture: _estimatedDeparture,
            estimatedArrival: _estimatedArrival,
            realDeparture: 0,
            realArrival: 0,
            isLate: false,
            insuranceProvider: _caller,
            insuredValue: 0,
            rate: _rate
        });

        currentFlightID++;
        flights[currentFlightID] = _flight;
    }

    // update flight data
    function updateFlight(
        uint256 _flightID,
        uint64 _realDeparture,
        uint64 _realArrival,
        bool _isLate
    ) external onlyAuthorizedCaller {
        Flight memory _flight = flights[_flightID];
        _flight.realDeparture = _realDeparture;
        _flight.realArrival = _realArrival;
        _flight.isLate = _isLate;
        flights[_flightID] = _flight;
    }

    // get current autoincrementing id of a given insurance provider aka airline
    function getCurrentFlightID()
        external
        view
        onlyAuthorizedCaller
        returns (uint256)
    {
        return currentFlightID;
    }

    // fetch a flight
    function getFlight(uint256 _flightID)
        external
        view
        onlyAuthorizedCaller
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
        )
    {
        Flight memory flight = flights[_flightID];
        return (
            flight.flightRef,
            flight.estimatedDeparture,
            flight.estimatedArrival,
            flight.realDeparture,
            flight.realArrival,
            flight.isLate,
            flight.insuranceProvider,
            flight.insuredValue,
            flight.rate
        );
    }

    /** insurance management */

    // insure a passenger for a given flight
    function insure(
        address _caller,
        uint256 _flightID,
        uint256 _insuredValue
    ) external onlyAuthorizedCaller {
        currentInsuranceID++;
        Insurance memory _insurance = Insurance({
            flightID: _flightID,
            insuredValue: _insuredValue,
            owner: _caller,
            claimed: false
        });
        flights[_flightID].insuredValue += _insuredValue;
        insurances[currentInsuranceID] = _insurance;
    }

    // set an insurance claimed attribute to true
    function setInsuranceToClaimed(uint256 _insuranceID)
        external
        onlyAuthorizedCaller
    {
        insurances[_insuranceID].claimed = true;
    }

    // amend the total insured value
    function setTotalInsuredValue(uint256 _totalInsuredValue)
        external
        onlyAuthorizedCaller
    {
        totalInsuredValue = _totalInsuredValue;
    }

    // fetch the current autoincrementing ID of a given passenger
    function getCurrentInsuranceID()
        external
        view
        onlyAuthorizedCaller
        returns (uint256)
    {
        return currentInsuranceID;
    }

    // fetch a passenger's insurance
    function getInsurance(uint256 _insuranceID)
        external
        view
        onlyAuthorizedCaller
        returns (
            uint256 flightID,
            uint256 insuredValue,
            address owner,
            bool claimed
        )
    {
        Insurance memory insurance = insurances[_insuranceID];
        return (
            insurance.flightID,
            insurance.insuredValue,
            insurance.owner,
            insurance.claimed
        );
    }

    // fetch the current total insured value
    function getTotalInsuredValue()
        external
        view
        onlyAuthorizedCaller
        returns (uint256)
    {
        return totalInsuredValue;
    }
}
