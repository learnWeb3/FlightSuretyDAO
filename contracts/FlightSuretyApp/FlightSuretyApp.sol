// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

import "./interfaces/FlightSuretyData.sol";
import "./interfaces/InsuranceCoverageAmendmentProposal.sol";
import "./interfaces/MembershipFeeAmendmentProposal.sol";
import "./interfaces/InsuranceProviderRole.sol";
import "./interfaces/OracleProviderRole.sol";
import "./interfaces/FlighSuretyOracle.sol";
import "./interfaces/FlighSuretyShares.sol";
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
    event NewFlight(uint256 indexed flightID, address insuranceProvider);

    // insurances related events
    event NewInsurance(
        address indexed passenger,
        uint256 indexed insuranceID,
        uint256 indexed flightID,
        uint256 insuredValue
    );
    event UpdatedInsurance(
        address indexed passenger,
        uint256 indexed insuranceID,
        uint256 indexed flightID
    );

    event NewPayout(
        uint256 indexed insuranceID,
        uint256 insuredValue,
        address indexed owner
    );

    // settings amendment proposal related events
    event NewMembershipFeeAmendmentProposal(
        uint256 indexed proposalID,
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
    event AuthorizedCaller(address caller, address contractAddress);
    event UnauthorizedCaller(address caller, address contractAddress);

    FlightSuretyData flightSuretyData;
    InsuranceCoverageAmendmentProposal insuranceCoverageAmendmentProposal;
    MembershipFeeAmendmentProposal membershipFeeAmendmentProposal;
    InsuranceProviderRole insuranceProviderRole;
    OracleProviderRole oracleProviderRole;
    FlighSuretyShares flighSuretyShares;

    // flights related checks

    modifier requireValidFlight(
        uint256 estimatedDeparture,
        uint256 estimatedArrival
    ) {
        require(
            estimatedDeparture > block.timestamp &&
                estimatedArrival > block.timestamp &&
                estimatedArrival > estimatedDeparture,
            "flight must be valid"
        );
        _;
    }

    // insurances related checks

    modifier requireFutureFlight(uint256 _flightID) {
        (, uint64 estimatedDeparture, , , , , , ) = flightSuretyData.getFlight(
            _flightID
        );
        require(
            estimatedDeparture > block.timestamp,
            "flight departure must be future"
        );
        _;
    }

    modifier requireFlightIsLate(uint256 _insuranceID) {
        (uint256 flightID, , , ) = flightSuretyData.getInsurance(_insuranceID);
        (, , , , , bool isLate, , ) = flightSuretyData.getFlight(flightID);
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

    modifier requireMinimumValue(uint256 minimumValue) {
        require(msg.value >= minimumValue, "minimum requirement does not match");
        _;
    }

    modifier requireTotalInsuredValueCoverage(uint256 newInsuranceValue) {
        uint256 currentTotalInsuredValue = flightSuretyData
            .getTotalInsuredValue();
        uint256 newTotalInsuredValue = currentTotalInsuredValue.add(
            newInsuranceValue
        );
        uint256 totalFundsWithCoverage = _calculateInsuredValueBenefits(
            newTotalInsuredValue
        );
        require(
            totalFundsWithCoverage >= address(this).balance,
            "current funds must cover new insurance value"
        );
        _;
    }

    // membership fee checks

    modifier requireMembershipFee() {
        uint256 currentMembershipFee = membershipFeeAmendmentProposal
            .getCurrentMembershipFee();
        require(
            msg.value >= currentMembershipFee,
            "incorrect fee sent to contract"
        );

        if (msg.value > currentMembershipFee) {
            payable(address(this)).transfer(
                msg.value.sub(currentMembershipFee)
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
        require(flighSuretyShares.balanceOf(_caller) > 0, "caller must be token holder");
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
            "caller must be insurance provider"
        );
        _;
    }

    modifier insuranceProviderHasNotVoted(address _caller, address _account) {
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

    modifier oracleProviderHasNotVoted(address _caller, address _account) {
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
        address _flighSuretyShares
    ) external onlyOwner {
        // registering external contracts address
        flightSuretyData = FlightSuretyData(_flightSuretyData);
        insuranceCoverageAmendmentProposal = InsuranceCoverageAmendmentProposal(
            _insuranceCoverageAmendmentProposal
        );
        membershipFeeAmendmentProposal = MembershipFeeAmendmentProposal(
            _membershipFeeAmendmentProposal
        );
        insuranceProviderRole = InsuranceProviderRole(_insuranceProviderRole);
        oracleProviderRole = OracleProviderRole(_oracleProviderRole);
        flighSuretyShares = FlighSuretyShares(_flighSuretyShares);
        // make the contract owner a registered insurance provider
        insuranceProviderRole.addInsuranceProvider(msg.sender);
        // make the contract owner an activated insurance provider
        insuranceProviderRole.activateInsuranceProvider(msg.sender);
    }

    /* external contracts calls management */

    function updateAuthorizedCallerFlightSuretyData(address _authorizedCaller)
        external
        onlyOwner
    {
        flightSuretyData.authorizeCaller(_authorizedCaller);
        emit AuthorizedCaller(_authorizedCaller, address(flightSuretyData));
    }

    function updateAuthorizedCallerInsuranceCoverageAmendmentProposal(
        address _authorizedCaller
    ) external onlyOwner {
        insuranceCoverageAmendmentProposal.authorizeCaller(_authorizedCaller);
        emit AuthorizedCaller(
            _authorizedCaller,
            address(insuranceCoverageAmendmentProposal)
        );
    }

    function updateAuthorizedCallerMembershipFeeAmendmentProposal(
        address _authorizedCaller
    ) external onlyOwner {
        membershipFeeAmendmentProposal.authorizeCaller(_authorizedCaller);
        emit AuthorizedCaller(
            _authorizedCaller,
            address(membershipFeeAmendmentProposal)
        );
    }

    function updateAuthorizedCallerInsuranceProviderRole(
        address _authorizedCaller
    ) external onlyOwner {
        insuranceProviderRole.authorizeCaller(_authorizedCaller);
        emit AuthorizedCaller(
            _authorizedCaller,
            address(insuranceProviderRole)
        );
    }

    function updateAuthorizedCallerOracleProviderRole(address _authorizedCaller)
        external
        onlyOwner
    {
        oracleProviderRole.authorizeCaller(_authorizedCaller);
        emit AuthorizedCaller(_authorizedCaller, address(oracleProviderRole));
    }

    function updateAuthorizedCallerFlighSuretyShares(address _authorizedCaller)
        external
        onlyOwner
    {
        flighSuretyShares.authorizeCaller(_authorizedCaller);
        emit AuthorizedCaller(_authorizedCaller, address(flighSuretyShares));
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
            flighSuretyShares.mint(msg.sender, sharesToMint);
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
            flighSuretyShares.mint(msg.sender, sharesToMint);
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
    {
        insuranceProviderRole.voteInsuranceProviderMembership(
            msg.sender,
            _account,
            flighSuretyShares.balanceOf(msg.sender)
        );
        bool consensusCheck = insuranceProviderRole
            .hasReachedConsensusInsuranceProviderMembership(
                true,
                _account,
                _calculateProvidersConsensusTreshold()
            );
        if (consensusCheck) {
            insuranceProviderRole.activateInsuranceProvider(_account);
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
    {
        oracleProviderRole.voteOracleProviderMembership(
            msg.sender,
            _account,
            flighSuretyShares.balanceOf(msg.sender)
        );
        bool consensusCheck = oracleProviderRole
            .hasReachedConsensusOracleProviderMembership(
                true,
                _account,
                _calculateProvidersConsensusTreshold()
            );
        if (consensusCheck) {
            oracleProviderRole.activateOracleProvider(_account);
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
        uint64 _estimatedArrival
    )
        external
        onlyActivatedInsuranceProvider(msg.sender)
        requireValidFlight(_estimatedDeparture, _estimatedArrival)
    {
        flightSuretyData.registerFlight(
            msg.sender,
            _flightRef,
            _estimatedDeparture,
            _estimatedArrival
        );
        uint256 flightID = flightSuretyData.getCurrentFlightID(msg.sender);
        emit NewFlight(flightID, msg.sender);
    }

    /* insurances management */

    function registerInsurance(uint256 _flightID)
        external
        payable
        requireFutureFlight(_flightID)
        requireMinimumValue(1 ether)
        requireTotalInsuredValueCoverage(msg.value)
    {
        // create insurance for the caller
        flightSuretyData.insure(msg.sender, _flightID, msg.value);
        // update total insured value  (locking up funds to be sure to be able to cover all funds locked up in contract)
        uint256 currentTotalInsuredValue = flightSuretyData
            .getTotalInsuredValue();
        flightSuretyData.setTotalInsuredValue(
            currentTotalInsuredValue.add(msg.value)
        );
        uint256 insuranceID = flightSuretyData.getCurrentInsuranceID();
        emit NewInsurance(msg.sender, insuranceID, _flightID, msg.value);
    }

    function claimInsurance(uint256 _insuranceID)
        external
        payable
        requireFlightIsLate(_insuranceID)
        onlyInsuranceOwner(_insuranceID)
        onlyInsuranceIsNotClaimed(_insuranceID)
    {
        // fetch the insurance insured value
        (, uint256 insuredValue, , ) = flightSuretyData.getInsurance(
            _insuranceID
        );
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
        emit NewPayout(_insuranceID, insuredValue, msg.sender);
    }

    /* Settings amendment proposals*/

    // membership fee amendment proposals

    function registerMembershipFeeAmendmentProposal(uint256 _proposedValue)
        external
        onlyTokenHolder(msg.sender)
    {
        membershipFeeAmendmentProposal.registerMembershipFeeAmendmentProposal(
            msg.sender,
            _proposedValue,
            flighSuretyShares.balanceOf(msg.sender)
        );
        uint256 _proposalID = membershipFeeAmendmentProposal
            .getMembershipFeeAmendmentProposalCurrentProposalID();
        emit NewMembershipFeeAmendmentProposal(_proposalID, _proposedValue);
    }

    function voteMembershipFeeAmendmentProposal(uint256 _proposalID)
        external
        onlyTokenHolder(msg.sender)
    {
        membershipFeeAmendmentProposal.voteMembershipFeeAmendmentProposal(
            _proposalID,
            msg.sender,
            true,
            flighSuretyShares.balanceOf(msg.sender)
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
                flighSuretyShares.balanceOf(msg.sender)
            );
        uint256 _proposalID = insuranceCoverageAmendmentProposal
            .getInsuranceCoverageAmendmentCurrentProposalID();
        emit NewInsuranceCoverageAmendmentProposal(_proposalID, _proposedValue);
    }

    function voteInsuranceCoverageAmendmentProposal(uint256 _proposalID)
        external
        onlyTokenHolder(msg.sender)
    {
        insuranceCoverageAmendmentProposal
            .voteInsuranceCoverageAmendmentProposal(
                _proposalID,
                msg.sender,
                true,
                flighSuretyShares.balanceOf(msg.sender)
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
        return flighSuretyShares.totalSupply().div(2);
    }

    function _calculateSharesToMint()
        internal
        pure
        returns (uint256 sharesToMint)
    {
        return 1;
    }
}
