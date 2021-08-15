// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

import "./interfaces/IFlightSuretyData.sol";
import "./interfaces/IInsuranceCoverageAmendmentProposal.sol";
import "./interfaces/IMembershipFeeAmendmentProposal.sol";
import "./interfaces/IInsuranceProviderRole.sol";
import "./interfaces/IOracleProviderRole.sol";
import "./interfaces/IFlightSuretyOracle.sol";
import "./interfaces/IFlightSuretyShares.sol";
import "../Ownable/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract FlightSuretyApp is Ownable {
    using SafeMath for uint256;
    // insurance providers related events
    event RegisteredInsuranceProvider(address indexed insuranceProvider);
    event ActivatedInsuranceProvider(address indexed insuranceProvider);
    event RemovedInsuranceProvider(address indexed insuranceProvider);
    event NewVoteInsuranceProvider(
        address indexed voter,
        bool indexed side,
        address indexed votee
    );

    // oracle providers related events
    event RegisteredOracleProvider(address indexed oracleProvider);
    event ActivatedOracleProvider(address indexed oracleProvider);
    event RemovedOracleProvider(address indexed oracleProvider);
    event NewVoteOracleProvider(
        address indexed voter,
        bool indexed side,
        address indexed votee
    );

    // flights related events
    event NewFlight(
        uint256 indexed flightID,
        address indexed insuranceProvider,
        uint256 estimatedDeparture,
        uint256 estimatedArrival,
        string flightRef,
        uint256 rate
    );

    // insurances related events
    event NewInsurance(
        address indexed passenger,
        address indexed insuranceProvider,
        uint256 indexed insuranceID,
        uint256 flightID,
        uint256 insuredValue
    );

    event NewPayout(
        address indexed owner,
        address indexed insuranceProvider,
        uint256 indexed insuranceID,
        uint256 flightID,
        uint256 insuredValue
    );

    // settings amendment proposal related events
    event NewMembershipFeeAmendmentProposal(
        uint256 indexed proposalID,
        address indexed caller,
        uint256 proposedMembershipFee
    );
    event NewVoteMembershipFeeAmendmentProposal(
        uint256 indexed proposalID,
        address indexed voter
    );
    event ActivatedMembershipFeeAmendmentProposal(
        uint256 indexed proposalID,
        uint256 lockedMembershipFee
    );
    event NewInsuranceCoverageAmendmentProposal(
        uint256 indexed proposalID,
        address indexed caller,
        uint256 insuranceCoverage
    );
    event ActivatedInsuranceCoverageAmendmentProposal(
        uint256 indexed proposalID,
        uint256 insuranceCoverage
    );
    event NewVoteInsuranceCoverageAmendmentProposal(
        uint256 indexed proposalID,
        address indexed voter
    );

    // authorize caller related events
    event AuthorizedCaller(
        address indexed contractOwner,
        address caller,
        address contractAddress
    );
    event UnauthorizedCaller(
        address indexed contractOwner,
        address caller,
        address contractAddress
    );

    uint256 constant public TOKEN_HOLDER_MINIMUM_BLOCK_REQUIREMENT = 390000;
    uint256 constant public PROPOSAL_VALID_BLOCK_NUMBER = 180000;

    IFlightSuretyData flightSuretyData;
    IInsuranceCoverageAmendmentProposal insuranceCoverageAmendmentProposal;
    IMembershipFeeAmendmentProposal membershipFeeAmendmentProposal;
    IInsuranceProviderRole insuranceProviderRole;
    IOracleProviderRole oracleProviderRole;
    IFlightSuretyShares flightSuretyShares;

    // settings amendment proposals related checks

    modifier requireTokenHolderHasNotVotedInsuranceCoverageAmendmentProposal(
        address _caller,
        uint256 _proposalID
    ) {
        require(
            !insuranceCoverageAmendmentProposal
                .hasVotedInsuranceCoverageAmendmentProposal(
                    _caller,
                    _proposalID
                ),
            "caller has already voted"
        );
        _;
    }

    modifier requireTokenHolderHasNotVotedMembershipFeeAmendmentProposal(
        address _caller,
        uint256 _proposalID
    ) {
        require(
            !membershipFeeAmendmentProposal
                .hasVotedMembershipFeeAmendmentProposal(_caller, _proposalID),
            "caller has already voted"
        );
        _;
    }

    modifier requireProposalIsActive(uint256 proposalID) {
        require(
            block.number -
                membershipFeeAmendmentProposal.getProposalCreatedAt(
                    proposalID
                ) <=
                PROPOSAL_VALID_BLOCK_NUMBER,
            "voting proposal has expired"
        );
        _;
    }

    // flights related checks

    modifier requireValidFlight(
        uint256 estimatedDeparture,
        uint256 estimatedArrival,
        uint256 rate
    ) {
        require(
            estimatedDeparture > block.timestamp &&
                estimatedArrival > block.timestamp &&
                estimatedArrival > estimatedDeparture &&
                rate <= 1 ether,
            "flight must be valid"
        );
        _;
    }

    // insurances related checks

    modifier requireMessageValueGreatherOrEqualToFlightRate(uint256 _flightID) {
        (, , , , , , , , uint256 rate) = flightSuretyData.getFlight(_flightID);
        require(msg.value >= rate, "sent value does not match flight rate");
        uint256 amountDue = rate - msg.value;
        _;
        payable(msg.sender).transfer(amountDue);
    }

    modifier requireFutureFlight(uint256 _flightID) {
        (, uint64 estimatedDeparture, , , , , , , ) = flightSuretyData
            .getFlight(_flightID);
        require(
            estimatedDeparture > block.timestamp,
            "flight departure must be future"
        );
        _;
    }

    modifier requireFlightIsLate(uint256 _insuranceID) {
        (uint256 flightID, , , ) = flightSuretyData.getInsurance(_insuranceID);
        (, , , , , bool isLate, , , ) = flightSuretyData.getFlight(flightID);
        require(isLate, "flight must be late");
        _;
    }

    modifier onlyInsuranceIsNotClaimed(uint256 _insuranceID) {
        (, , , bool claimed) = flightSuretyData.getInsurance(_insuranceID);
        require(!claimed, "insurance must not have been claimed");
        _;
    }
    modifier onlyInsuranceOwner(uint256 _insuranceID) {
        (, , address owner, ) = flightSuretyData.getInsurance(_insuranceID);
        require(msg.sender == owner, "caller must be insurance owner");
        _;
    }

    modifier requireTotalInsuredValueCoverage(uint256 newInsuranceValue) {
        uint256 totalFundsWithCoverage = _calculateInsuredValueBenefits(
            flightSuretyData.getTotalInsuredValue().add(newInsuranceValue)
        );
        require(
            totalFundsWithCoverage <= address(this).balance,
            "current funds must cover new insurance value"
        );
        _;
    }

    // membership fee checks

    modifier requireMembershipFee() {
        uint256 _currentMembershipFee = membershipFeeAmendmentProposal
            .getCurrentMembershipFee();
        require(
            msg.value >= _currentMembershipFee,
            "incorrect fee sent to contract"
        );

        if (msg.value > _currentMembershipFee) {
            payable(address(this)).transfer(
                msg.value.sub(_currentMembershipFee)
            );
        }
        _;
    }

    // common roles checks

    modifier onlyActivatedProvider(address _caller) {
        require(
            insuranceProviderRole.isActivatedInsuranceProvider(_caller) ||
                oracleProviderRole.isActivatedOracleProvider(_caller),
            "caller must be activated provider"
        );
        _;
    }

    modifier onlyTokenHolder(address _caller) {
        require(
            flightSuretyShares.balanceOf(_caller) > 0,
            "caller must be token holder"
        );
        _;
    }

    modifier requireTokenHolderIsOldEnough(address _caller) {
        require(
            block.number - flightSuretyShares.ownershipBlockNum(_caller) >=
                TOKEN_HOLDER_MINIMUM_BLOCK_REQUIREMENT,
            "caller must be an old token holder"
        );
        _;
    }

    // insurance providers checks

    modifier onlyRegisteredInsuranceProvider(address _caller) {
        require(
            insuranceProviderRole.isRegisteredInsuranceProvider(_caller),
            "caller must be insurance provider"
        );
        _;
    }

    modifier onlyActivatedInsuranceProvider(address _caller) {
        require(
            insuranceProviderRole.isActivatedInsuranceProvider(_caller),
            "caller must be activated insurance provider"
        );
        _;
    }

    modifier requireTokenHolderHasNotVotedInsuranceProviderMembership(
        address _caller,
        address _account
    ) {
        require(
            !insuranceProviderRole.hasVotedInsuranceProviderMembership(
                _account,
                _caller
            ),
            "caller has already voted"
        );
        _;
    }

    // oracle providers checks

    modifier onlyRegisteredOracleProvider(address _caller) {
        require(
            oracleProviderRole.isRegisteredOracleProvider(_caller),
            "caller must be oracle provider"
        );
        _;
    }

    modifier onlyActivatedOracleProvider(address _caller) {
        require(
            oracleProviderRole.isActivatedOracleProvider(_caller),
            "caller is not activated oracle provider"
        );
        _;
    }

    modifier requireTokenHolderHasNotVotedOracleProviderMembership(
        address _caller,
        address _account
    ) {
        require(
            !oracleProviderRole.hasVotedOracleProviderMembership(
                _account,
                _caller
            ),
            "caller has already voted"
        );
        _;
    }

    constructor() Ownable() {}

    // initialize external contracts addresses
    function initialize(
        address _flightSuretyData,
        address _insuranceCoverageAmendmentProposal,
        address _membershipFeeAmendmentProposal,
        address _insuranceProviderRole,
        address _oracleProviderRole,
        address _flightSuretyShares
    ) external onlyOwner {
        // registering external contracts address
        flightSuretyData = IFlightSuretyData(_flightSuretyData);
        insuranceCoverageAmendmentProposal = IInsuranceCoverageAmendmentProposal(
            _insuranceCoverageAmendmentProposal
        );
        membershipFeeAmendmentProposal = IMembershipFeeAmendmentProposal(
            _membershipFeeAmendmentProposal
        );
        insuranceProviderRole = IInsuranceProviderRole(_insuranceProviderRole);
        oracleProviderRole = IOracleProviderRole(_oracleProviderRole);
        flightSuretyShares = IFlightSuretyShares(_flightSuretyShares);
        // make the contract owner a registered insurance provider
        insuranceProviderRole.addInsuranceProvider(msg.sender);
        // make the contract owner an activated insurance provider
        insuranceProviderRole.activateInsuranceProvider(msg.sender);
    }

    /* external contracts calls management */

    function updateAuthorizedCallerFlightSuretyData(
        address _authorizedCaller,
        bool _access
    ) external onlyOwner {
        if (_access) {
            flightSuretyData.authorizeCaller(_authorizedCaller);
            emit AuthorizedCaller(
                msg.sender,
                _authorizedCaller,
                address(flightSuretyData)
            );
        } else {
            flightSuretyData.unauthorizeCaller(_authorizedCaller);
            emit UnauthorizedCaller(
                msg.sender,
                _authorizedCaller,
                address(flightSuretyData)
            );
        }
    }

    function updateAuthorizedCallerInsuranceCoverageAmendmentProposal(
        address _authorizedCaller,
        bool _access
    ) external onlyOwner {
        if (_access) {
            insuranceCoverageAmendmentProposal.authorizeCaller(
                _authorizedCaller
            );
            emit AuthorizedCaller(
                msg.sender,
                _authorizedCaller,
                address(insuranceCoverageAmendmentProposal)
            );
        } else {
            insuranceCoverageAmendmentProposal.unauthorizeCaller(
                _authorizedCaller
            );
            emit UnauthorizedCaller(
                msg.sender,
                _authorizedCaller,
                address(insuranceCoverageAmendmentProposal)
            );
        }
    }

    function updateAuthorizedCallerMembershipFeeAmendmentProposal(
        address _authorizedCaller,
        bool _access
    ) external onlyOwner {
        if (_access) {
            membershipFeeAmendmentProposal.authorizeCaller(_authorizedCaller);
            emit AuthorizedCaller(
                msg.sender,
                _authorizedCaller,
                address(membershipFeeAmendmentProposal)
            );
        } else {
            membershipFeeAmendmentProposal.unauthorizeCaller(_authorizedCaller);
            emit UnauthorizedCaller(
                msg.sender,
                _authorizedCaller,
                address(membershipFeeAmendmentProposal)
            );
        }
    }

    function updateAuthorizedCallerInsuranceProviderRole(
        address _authorizedCaller,
        bool _access
    ) external onlyOwner {
        if (_access) {
            insuranceProviderRole.authorizeCaller(_authorizedCaller);
            emit AuthorizedCaller(
                msg.sender,
                _authorizedCaller,
                address(insuranceProviderRole)
            );
        } else {
            insuranceProviderRole.unauthorizeCaller(_authorizedCaller);
            emit UnauthorizedCaller(
                msg.sender,
                _authorizedCaller,
                address(insuranceProviderRole)
            );
        }
    }

    function updateAuthorizedCallerOracleProviderRole(
        address _authorizedCaller,
        bool _access
    ) external onlyOwner {
        if (_access) {
            oracleProviderRole.authorizeCaller(_authorizedCaller);
            emit AuthorizedCaller(
                msg.sender,
                _authorizedCaller,
                address(oracleProviderRole)
            );
        } else {
            oracleProviderRole.unauthorizeCaller(_authorizedCaller);
            emit UnauthorizedCaller(
                msg.sender,
                _authorizedCaller,
                address(oracleProviderRole)
            );
        }
    }

    function updateAuthorizedCallerFlighSuretyShares(
        address _authorizedCaller,
        bool _access
    ) external onlyOwner {
        if (_access) {
            flightSuretyShares.authorizeCaller(_authorizedCaller);
            emit AuthorizedCaller(
                msg.sender,
                _authorizedCaller,
                address(flightSuretyShares)
            );
        } else {
            flightSuretyShares.unauthorizeCaller(_authorizedCaller);
            emit UnauthorizedCaller(
                msg.sender,
                _authorizedCaller,
                address(flightSuretyShares)
            );
        }
    }

    /* providers registrations */

    // insurance providers

    function registerInsuranceProvider() external payable requireMembershipFee {
        insuranceProviderRole.addInsuranceProvider(msg.sender);
        uint256 registeredInsuranceProviderCount = insuranceProviderRole
            .getRegisteredInsuranceProvidersCount();
        if (registeredInsuranceProviderCount <= 4) {
            insuranceProviderRole.activateInsuranceProvider(msg.sender);
            uint256 sharesToMint = _calculateSharesToMint();
            flightSuretyShares.mint(msg.sender, sharesToMint);
            emit RegisteredInsuranceProvider(msg.sender);
            emit ActivatedInsuranceProvider(msg.sender);
        } else {
            emit RegisteredInsuranceProvider(msg.sender);
        }
    }

    // oracle providers

    function registerOracleProvider() external payable requireMembershipFee {
        oracleProviderRole.addOracleProvider(msg.sender);
        uint256 registeredOracleProviderCount = oracleProviderRole
            .getRegisteredOracleProvidersCount();
        if (registeredOracleProviderCount <= 4) {
            oracleProviderRole.activateOracleProvider(msg.sender);
            uint256 sharesToMint = _calculateSharesToMint();
            flightSuretyShares.mint(msg.sender, sharesToMint);
            emit RegisteredOracleProvider(msg.sender);
            emit ActivatedOracleProvider(msg.sender);
        } else {
            emit RegisteredOracleProvider(msg.sender);
        }
    }

    /* votes providers */

    // insurance providers

    function voteInsuranceProviderMembership(address _account)
        external
        onlyTokenHolder(msg.sender)
        requireTokenHolderIsOldEnough(msg.sender)
        requireTokenHolderHasNotVotedInsuranceProviderMembership(
            msg.sender,
            _account
        )
    {
        insuranceProviderRole.voteInsuranceProviderMembership(
            msg.sender,
            _account,
            flightSuretyShares.balanceOf(msg.sender)
        );
        bool consensusCheck = insuranceProviderRole
            .hasReachedConsensusInsuranceProviderMembership(
                true,
                _account,
                _calculateProvidersConsensusTreshold()
            );
        if (consensusCheck) {
            insuranceProviderRole.activateInsuranceProvider(_account);
            uint256 sharesToMint = _calculateSharesToMint();
            flightSuretyShares.mint(_account, sharesToMint);
            emit NewVoteInsuranceProvider(msg.sender, true, _account);
            emit ActivatedInsuranceProvider(_account);
        } else {
            emit NewVoteInsuranceProvider(msg.sender, true, _account);
        }
    }

    // oracle providers

    function voteOracleProviderMembership(address _account)
        external
        onlyTokenHolder(msg.sender)
        requireTokenHolderIsOldEnough(msg.sender)
        requireTokenHolderHasNotVotedOracleProviderMembership(
            msg.sender,
            _account
        )
    {
        oracleProviderRole.voteOracleProviderMembership(
            msg.sender,
            _account,
            flightSuretyShares.balanceOf(msg.sender)
        );
        bool consensusCheck = oracleProviderRole
            .hasReachedConsensusOracleProviderMembership(
                true,
                _account,
                _calculateProvidersConsensusTreshold()
            );
        if (consensusCheck) {
            oracleProviderRole.activateOracleProvider(_account);
            uint256 sharesToMint = _calculateSharesToMint();
            flightSuretyShares.mint(_account, sharesToMint);
            emit NewVoteOracleProvider(msg.sender, true, _account);
            emit ActivatedOracleProvider(_account);
        } else {
            emit NewVoteOracleProvider(msg.sender, true, _account);
        }
    }

    /* flights management */

    function registerFlight(
        string calldata _flightRef,
        uint64 _estimatedDeparture,
        uint64 _estimatedArrival,
        uint256 _rate
    )
        external
        onlyActivatedInsuranceProvider(msg.sender)
        requireValidFlight(_estimatedDeparture, _estimatedArrival, _rate)
    {
        flightSuretyData.registerFlight(
            msg.sender,
            _flightRef,
            _estimatedDeparture,
            _estimatedArrival,
            _rate
        );
        uint256 flightID = flightSuretyData.getCurrentFlightID();
        emit NewFlight(
            flightID,
            msg.sender,
            _estimatedDeparture,
            _estimatedArrival,
            _flightRef,
            _rate
        );
    }

    function getFlightInitialData(uint256 _flightID)
        external
        view
        returns (
            string memory flightRef,
            uint64 estimatedDeparture,
            uint64 estimatedArrival,
            address insuranceProvider,
            uint256 rate
        )
    {
        (
            flightRef,
            estimatedDeparture,
            estimatedArrival,
            ,
            ,
            ,
            insuranceProvider,
            ,
            rate
        ) = flightSuretyData.getFlight(_flightID);
        return (
            flightRef,
            estimatedDeparture,
            estimatedArrival,
            insuranceProvider,
            rate
        );
    }

    function getFlightSettlementData(uint256 _flightID)
        external
        view
        returns (
            string memory flightRef,
            uint64 realDeparture,
            uint64 realArrival,
            bool isLate,
            address insuranceProvider,
            uint256 insuredValue
        )
    {
        (
            flightRef,
            ,
            ,
            realDeparture,
            realArrival,
            isLate,
            insuranceProvider,
            insuredValue,

        ) = flightSuretyData.getFlight(_flightID);
        return (
            flightRef,
            realDeparture,
            realArrival,
            isLate,
            insuranceProvider,
            insuredValue
        );
    }

    /* insurances management */

    function registerInsurance(uint256 _flightID)
        external
        payable
        requireFutureFlight(_flightID)
        requireMessageValueGreatherOrEqualToFlightRate(_flightID)
        requireTotalInsuredValueCoverage(msg.value)
    {
        // fetch flight rate
        (
            ,
            ,
            ,
            ,
            ,
            ,
            address insuranceProvider,
            ,
            uint256 rate
        ) = flightSuretyData.getFlight(_flightID);
        // create insurance for the caller
        flightSuretyData.insure(msg.sender, _flightID, rate);
        // update total insured value  (locking up funds to be sure to be able to cover all funds locked up in contract)
        _incrementTotalInsuredValue(rate);
        uint256 insuranceID = flightSuretyData.getCurrentInsuranceID();
        emit NewInsurance(
            msg.sender,
            insuranceProvider,
            insuranceID,
            _flightID,
            rate
        );
    }

    function claimInsurance(uint256 _insuranceID)
        external
        payable
        requireFlightIsLate(_insuranceID)
        onlyInsuranceOwner(_insuranceID)
        onlyInsuranceIsNotClaimed(_insuranceID)
    {
        // fetch the insurance insured value
        (uint256 flightID, uint256 insuredValue, , ) = flightSuretyData
            .getInsurance(_insuranceID);
        // fetch the flight data
        (, , , , , , address insuranceProvider, , ) = flightSuretyData
            .getFlight(flightID);
        // update insurance to claimed
        flightSuretyData.setInsuranceToClaimed(_insuranceID);
        // update total insured value as funds are about to be sent (unlocking funds to take new insurance contracts)
        uint256 currentTotalInsuredValue = flightSuretyData
            .getTotalInsuredValue();
        flightSuretyData.setTotalInsuredValue(
            currentTotalInsuredValue.sub(insuredValue)
        );
        // calculate the amount to transfer according to the insurance coverage policy
        uint256 amountToTransfer = _calculateInsuredValueBenefits(insuredValue);
        payable(msg.sender).transfer(amountToTransfer);
        emit NewPayout(
            msg.sender,
            insuranceProvider,
            _insuranceID,
            flightID,
            insuredValue
        );
    }

    /* Settings amendment proposals*/

    // fetch the current membership fee
    function currentMembershipFee() external view returns (uint256) {
        return membershipFeeAmendmentProposal.getCurrentMembershipFee();
    }

    // fetch the current insurance coverage ratio
    function currentInsuranceCoverageRatio() external view returns (uint256) {
        return insuranceCoverageAmendmentProposal.getCurrentInsuranceCoverage();
    }

    // membership fee amendment proposals

    function registerMembershipFeeAmendmentProposal(uint256 _proposedValue)
        external
        onlyTokenHolder(msg.sender)
    {
        membershipFeeAmendmentProposal.registerMembershipFeeAmendmentProposal(
            msg.sender,
            _proposedValue,
            flightSuretyShares.balanceOf(msg.sender)
        );
        uint256 _proposalID = membershipFeeAmendmentProposal
            .getMembershipFeeAmendmentProposalCurrentProposalID();
        emit NewMembershipFeeAmendmentProposal(
            _proposalID,
            msg.sender,
            _proposedValue
        );
        emit NewVoteMembershipFeeAmendmentProposal(_proposalID, msg.sender);
    }

    function voteMembershipFeeAmendmentProposal(uint256 _proposalID)
        external
        onlyTokenHolder(msg.sender)
        requireTokenHolderIsOldEnough(msg.sender)
        requireTokenHolderHasNotVotedMembershipFeeAmendmentProposal(
            msg.sender,
            _proposalID
        )
        requireProposalIsActive(_proposalID)
    {
        membershipFeeAmendmentProposal.voteMembershipFeeAmendmentProposal(
            _proposalID,
            msg.sender,
            true,
            flightSuretyShares.balanceOf(msg.sender)
        );
        bool consensusCheck = membershipFeeAmendmentProposal
            .hasMembershipFeeAmendmentProposalReachedConsensus(
                _proposalID,
                true,
                _calculateProvidersConsensusTreshold()
            );
        if (consensusCheck) {
            membershipFeeAmendmentProposal
                .activateMembershipFeeAmendmentProposal(_proposalID);
            uint256 lockedMembershipFee = membershipFeeAmendmentProposal
                .getCurrentMembershipFee();
            emit NewVoteMembershipFeeAmendmentProposal(_proposalID, msg.sender);
            emit ActivatedMembershipFeeAmendmentProposal(
                _proposalID,
                lockedMembershipFee
            );
        } else {
            emit NewVoteMembershipFeeAmendmentProposal(_proposalID, msg.sender);
        }
    }

    // insurance coverage amendment proposal

    function registerInsuranceCoverageAmendmentProposal(uint256 _proposedValue)
        external
        onlyTokenHolder(msg.sender)
    {
        insuranceCoverageAmendmentProposal
            .registerInsuranceCoverageAmendmentProposal(
                msg.sender,
                _proposedValue,
                flightSuretyShares.balanceOf(msg.sender)
            );
        uint256 _proposalID = insuranceCoverageAmendmentProposal
            .getInsuranceCoverageAmendmentCurrentProposalID();
        emit NewInsuranceCoverageAmendmentProposal(
            _proposalID,
            msg.sender,
            _proposedValue
        );
        emit NewVoteInsuranceCoverageAmendmentProposal(_proposalID, msg.sender);
    }

    function voteInsuranceCoverageAmendmentProposal(uint256 _proposalID)
        external
        onlyTokenHolder(msg.sender)
        requireTokenHolderIsOldEnough(msg.sender)
        requireTokenHolderHasNotVotedInsuranceCoverageAmendmentProposal(
            msg.sender,
            _proposalID
        )
        requireProposalIsActive(_proposalID)
    {
        insuranceCoverageAmendmentProposal
            .voteInsuranceCoverageAmendmentProposal(
                _proposalID,
                msg.sender,
                true,
                flightSuretyShares.balanceOf(msg.sender)
            );
        bool consensusCheck = insuranceCoverageAmendmentProposal
            .hasInsuranceCoverageAmendmentProposalReachedConsensus(
                _proposalID,
                true,
                _calculateProvidersConsensusTreshold()
            );
        if (consensusCheck) {
            insuranceCoverageAmendmentProposal
                .activateInsuranceCoverageAmendmentProposal(_proposalID);
            uint256 insuranceCoverage = insuranceCoverageAmendmentProposal
                .getCurrentInsuranceCoverage();
            emit NewVoteInsuranceCoverageAmendmentProposal(
                _proposalID,
                msg.sender
            );
            emit ActivatedInsuranceCoverageAmendmentProposal(
                _proposalID,
                insuranceCoverage
            );
        } else {
            emit NewVoteInsuranceCoverageAmendmentProposal(
                _proposalID,
                msg.sender
            );
        }
    }

     // fetch the oracle provider indexes
    function getOracleIndexes() external view onlyActivatedOracleProvider(msg.sender)
        returns (
            uint256 index1,
            uint256 index2,
            uint256 index3
        ){
            (index1, index2, index3) = oracleProviderRole.getOracleIndexes(msg.sender);
            return (index1, index2, index3);
        }

    function _incrementTotalInsuredValue(uint256 _addedValue) internal {
        uint256 currentTotalInsuredValue = flightSuretyData
            .getTotalInsuredValue();
        flightSuretyData.setTotalInsuredValue(
            currentTotalInsuredValue.add(_addedValue)
        );
    }

    function _calculateInsuredValueBenefits(uint256 initialValue)
        internal
        view
        returns (uint256 insuredValueCoverage)
    {
        uint256 currentInsuranceCoverage = insuranceCoverageAmendmentProposal
            .getCurrentInsuranceCoverage();
        return initialValue.mul(currentInsuranceCoverage).div(100);
    }

    function _calculateProvidersConsensusTreshold()
        internal
        view
        returns (uint256 providersConsensusTreshold)
    {
        return flightSuretyShares.totalSupply().div(2);
    }

    function _calculateSharesToMint()
        internal
        pure
        returns (uint256 sharesToMint)
    {
        return 1;
    }
}
