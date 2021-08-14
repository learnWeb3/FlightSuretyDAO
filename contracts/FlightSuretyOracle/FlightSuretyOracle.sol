// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

import "../Ownable/Ownable.sol";
import "../Random/Random.sol";
import "./interfaces/IOracleProviderRoleOracle.sol";
import "./interfaces/IFlightSuretyDataOracle.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract FlightSuretyOracle is Ownable, Random {
    using SafeMath for uint256;
    struct Request {
        uint256 flightID;
        string flightRef;
        uint256 activatedIndex;
        uint256 responseCount;
    }

    uint256 constant ACCEPTED_ANSWER_TRESHOLD = 5;
    uint256 currentRequestID;
    mapping(uint256 => Request) requests;
    mapping(uint256 => mapping(uint256 => uint256)) responses;
    mapping(uint256 => mapping(address => bool)) responseCallers;
    mapping(uint256 => uint256[3]) acceptedAnswer;
    IFlightSuretyDataOracle flightSuretyData;
    IOracleProviderRoleOracle oracleProviderRole;

    // requests related events
    event NewRequest(
        uint256 indexed requestID,
        uint256 indexed flightID,
        uint256 indexed activatedIndex,
        string flightRef
    );
    event FailedRequest(
        uint256 indexed requestID,
        uint256 indexed flightID,
        string flightRef
    );
    // responses related events
    event NewResponse(
        uint256 indexed requestID,
        uint256 realDeparture,
        uint256 realArrival,
        uint256 isLate
    );
    event AcceptedResponse(
        uint256 _realArrival,
        uint256 _realDeparture,
        uint256 _isLate
    );
    // flights related events
    event UpdatedFlight(
        uint256 indexed flightID,
        uint256 realDeparture,
        uint256 realArrival,
        bool isLate
    );

    modifier onlyActivatedOracleProvider(address _caller) {
        require(
            oracleProviderRole.isActivatedOracleProvider(_caller),
            "caller is not activated oracle provider"
        );
        _;
    }

    modifier onlySelectedOracleProvider(uint256 _requestID) {
        uint256[3] memory oracleProvidersIndexes = oracleProviderRole
            .getOracleProviderIndexes(msg.sender);
        require(
            oracleProvidersIndexes[0] == requests[_requestID].activatedIndex ||
                oracleProvidersIndexes[1] ==
                requests[_requestID].activatedIndex ||
                oracleProvidersIndexes[2] ==
                requests[_requestID].activatedIndex,
            "oracle provider indexes must match request indexes"
        );
        _;
    }

    modifier requireFlightExists(uint256 _flightID) {
        (
            ,
            uint64 estimatedDeparture,
            uint64 estimatedArrival,
            ,
            ,
            ,
            ,

        ) = flightSuretyData.getFlight(_flightID);
        require(
            estimatedDeparture > 0 && estimatedArrival > 0,
            "flight must exists"
        );
        _;
    }

    // constructor setting owner and initial authorized caller address aka appAddress
    constructor() Ownable() {}

    // initialize external contracts addresses
    function initialize(address _flightSuretyData, address _oracleProviderRole)
        external
        onlyOwner
    {
        // registering external contracts address
        flightSuretyData = IFlightSuretyDataOracle(_flightSuretyData);
        oracleProviderRole = IOracleProviderRoleOracle(_oracleProviderRole);
    }

    // create a request for a targeted oracle provider subset
    function createRequest(uint256 _flightID, string calldata _flightRef)
        external
        onlyActivatedOracleProvider(msg.sender)
        requireFlightExists(_flightID)
    {
        uint256 _randomIndex = _rand(20);
        currentRequestID++;
        requests[currentRequestID] = Request({
            flightID: _flightID,
            flightRef: _flightRef,
            activatedIndex: _randomIndex,
            responseCount: 0
        });
        emit NewRequest(currentRequestID, _flightID, _randomIndex, _flightRef);
    }

    // update responses to a request and validate the accepted outcome according to multiparty consensus rules
    function respondToRequest(
        address _caller,
        uint256 _requestID,
        uint256 _realDeparture,
        uint256 _realArrival,
        uint256 _isLate
    )
        external
        onlyActivatedOracleProvider(msg.sender)
        requireFlightExists(requests[_requestID].flightID)
    {
        _updateResponses(
            _caller,
            _requestID,
            _realDeparture,
            _realArrival,
            _isLate
        );
        _acceptResponse(_requestID, _realDeparture, _realArrival, _isLate);
    }

    // update responses to a request incrementing each outcomes to decide which response makes consensus among the selected set of oracle provider
    function _updateResponses(
        address _caller,
        uint256 _requestID,
        uint256 _realDeparture,
        uint256 _realArrival,
        uint256 _isLate
    ) internal {
        requests[_requestID].responseCount++;
        responseCallers[_requestID][_caller] = true;
        responses[_requestID][_realDeparture]++;
        responses[_requestID][_realArrival]++;
        responses[_requestID][_isLate]++;
        if (
            responses[_requestID][acceptedAnswer[_requestID][0]] >
            responses[_requestID][_realDeparture]
        ) {
            acceptedAnswer[_requestID][0] = _realDeparture;
        }

        if (
            responses[_requestID][acceptedAnswer[_requestID][1]] >
            responses[_requestID][_realArrival]
        ) {
            acceptedAnswer[_requestID][1] = _realArrival;
        }

        if (
            responses[_requestID][acceptedAnswer[_requestID][2]] >
            responses[_requestID][_isLate]
        ) {
            acceptedAnswer[_requestID][2] = _isLate;
        }
    }

    // accept or reject an accepted response as the final one according to a set treshold constant
    function _acceptResponse(
        uint256 _requestID,
        uint256 _realDeparture,
        uint256 _realArrival,
        uint256 _isLate
    ) internal {
        if (
            responses[_requestID][acceptedAnswer[_requestID][0]] >=
            ACCEPTED_ANSWER_TRESHOLD &&
            responses[_requestID][acceptedAnswer[_requestID][1]] >=
            ACCEPTED_ANSWER_TRESHOLD &&
            responses[_requestID][acceptedAnswer[_requestID][2]] >=
            ACCEPTED_ANSWER_TRESHOLD
        ) {
            uint256 _flightID = requests[_requestID].flightID;
            (, , , , , bool isLate, , uint256 insuredValue) = flightSuretyData
                .getFlight(_flightID);
            // update flight attributes
            _updateFlight(_requestID, _realDeparture, _realArrival, _isLate);
            // update total insured value if flight is not late (no funds to cover anymore)
            _updateTotalInsuredValue(isLate, insuredValue);
            emit NewResponse(_requestID, _realDeparture, _realArrival, _isLate);
            emit AcceptedResponse(_realArrival, _realDeparture, _isLate);
            emit UpdatedFlight(_flightID, _realDeparture, _realArrival, isLate);
        } else {
            if (requests[_requestID].responseCount > ACCEPTED_ANSWER_TRESHOLD) {
                uint256 _flightID = requests[_requestID].flightID;
                string memory _flightRef = requests[_requestID].flightRef;
                emit FailedRequest(_requestID, _flightID, _flightRef);
            }
            emit NewResponse(_requestID, _realDeparture, _realArrival, _isLate);
        }
    }

    // update flight data
    function _updateFlight(
        uint256 _requestID,
        uint256 _realDeparture,
        uint256 _realArrival,
        uint256 _isLate
    ) internal {
        uint256 _flightID = requests[_requestID].flightID;
        bool isLate = (_isLate == 1) ? true : false;
        flightSuretyData.updateFlight(
            _flightID,
            uint64(_realDeparture),
            uint64(_realArrival),
            isLate
        );
    }

    // update insured value if flight is not late (no funds to cover anymore)
    function _updateTotalInsuredValue(bool _isLate, uint256 _flightInsuredValue)
        internal
    {
        if (!_isLate) {
            uint256 totalInsuredValue = flightSuretyData.getTotalInsuredValue();
            uint256 newTotalInsuredValue = totalInsuredValue.sub(
                _flightInsuredValue
            );
            flightSuretyData.setTotalInsuredValue(newTotalInsuredValue);
        }
    }
}
