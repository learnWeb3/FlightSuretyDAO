/**
 
  Application workflow : 

      1- register an insurance provider through FlightSuretyApp contract
      2- register an oracle provider through FlightSuretyApp contract
      3- if insurance providers count is greater than 4 : vote the membership activation (all token holders can vote)
      4- if oracle provider count is greater than 4 : vote the membership activation (all token holders can vote)
      5- register a flight as an activated insurance provider through FlightSuretyApp contract
      6- register an insurance through FlightSuretyApp contract
      7- update flights data as oracle provider through FlightSuretyOracle contract
      8- claim the insurance if flight is late

      At any time as a token holder I can :
      - register a membership fee amendment proposal
      - vote up an existing membership amendment proposal
      (the current membership fee will be updated when 50% of the participants have voted up the proposal thus reaching consensus among the community)
      - register an insurance coverage amendment proposal
      - vote up an existing insurance coverage amendment proposal
      (the current insurance coverage will be updated when 50% of the participants have voted up the proposal thus reaching consensus among the community)

      Every year (calculated as 365 days after the first contract deployment) token holders
      will be able during a week to burn their token in exchange for their respective share of the insurance funds profits;
      A specific contract will be deployed following a community vote;

      The FSS token will be scoped as a security token.

*/
const BigNumber = require("bignumber.js");
const assert = require("chai").assert;
// current contract
const FlightSuretyApp = artifacts.require("FlightSuretyApp");
// external contracts
const FlightSuretyData = artifacts.require("FlightSuretyData");
const FlightSuretyShares = artifacts.require("FlightSuretyShares");
const FlightSuretyOracle = artifacts.require("FlightSuretyOracle");
const OracleProviderRole = artifacts.require("OracleProviderRole");
const InsuranceProviderRole = artifacts.require("InsuranceProviderRole");
const InsuranceCoverageAmendmentProposal = artifacts.require(
  "InsuranceCoverageAmendmentProposal"
);
const MembershipFeeAmendmentProposal = artifacts.require(
  "MembershipFeeAmendmentProposal"
);

contract(FlightSuretyApp, async (accounts) => {
  // accounts and contracts variables
  const owner = accounts[0];
  const activatedInsuranceProviderOne = accounts[1];
  const activatedInsuranceProviderTwo = accounts[2];
  const activatedInsuranceProviderThree = accounts[3];
  const registeredInsuranceProviderOne = accounts[4];
  const registeredInsuranceProviderTwo = accounts[5];
  const activatedOracleProviderOne = accounts[6];
  const activatedOracleProviderTwo = accounts[7];
  const activatedOracleProviderThree = accounts[8];
  const registeredOracleProviderOne = accounts[9];
  const authorizedCaller = accounts[6];
  const unauthorizedCaller = accounts[9];
  let flightSuretyDataAddress;
  let oracleProviderRoleAddress;
  let insuranceProviderRoleAddress;
  let membershipFeeAmendmentProposalAddress;
  let insuranceCoverageAmendmentProposalAddress;
  let flightSuretyOracleAddress;

  // flights mock data
  const flightID = 1;
  const flightRef = "UA840";
  const estimatedDeparture = parseInt(
    (Date.now() + 3600 * 24 * 1000).toString().slice(0, -3)
  );
  const estimatedArrival = estimatedDeparture + 3600 * 2;
  const rate = web3.utils.toWei("0.5", "ether");
  const invalidEstimatedDeparture = parseInt(
    Date.now() - (3600 * 24 * 1000).toString().slice(0, -3)
  );
  const invalidEstimatedArrival = estimatedDeparture + 3600 * 2;

  // initialize external contracts addresses

  it("As a contract owner it initialize external contracts addresses", async () => {
    const contract = await FlightSuretyApp.deployed();
    // oracle
    let flightSuretyOracle = await FlightSuretyOracle.new({ from: owner });
    // roles
    let oracleProviderRole = await OracleProviderRole.new(
      contract.address,
      flightSuretyOracle.address,
      { from: owner }
    );
    let insuranceProviderRole = await InsuranceProviderRole.new(
      contract.address,
      { from: owner }
    );
    // data
    let flightSuretyData = await FlightSuretyData.new(
      contract.address,
      flightSuretyOracle.address,
      { from: owner }
    );
    // token
    let flightSuretyShares = await FlightSuretyShares.new(contract.address, {
      from: owner,
    });
    // settings amendment proposal
    let insuranceCoverageAmendmentProposal =
      await InsuranceCoverageAmendmentProposal.new(contract.address, {
        from: owner,
      });
    let membershipFeeAmendmentProposal =
      await MembershipFeeAmendmentProposal.new(contract.address, {
        from: owner,
      });
    // storing addresses of external deployed contract
    oracleProviderRoleAddress = oracleProviderRole.address;
    flightSuretyDataAddress = flightSuretyData.address;
    insuranceProviderRoleAddress = insuranceProviderRole.address;
    membershipFeeAmendmentProposalAddress =
      membershipFeeAmendmentProposal.address;
    insuranceCoverageAmendmentProposalAddress =
      insuranceCoverageAmendmentProposal.address;
    flightSuretySharesAddress = flightSuretyShares.address;
    flightSuretyOracleAddress = flightSuretyOracle.address;

    // referencing external contract address in flightsuretyOracle
    await contract.initialize(
      flightSuretyDataAddress,
      insuranceCoverageAmendmentProposalAddress,
      membershipFeeAmendmentProposalAddress,
      insuranceProviderRoleAddress,
      oracleProviderRoleAddress,
      flightSuretySharesAddress,
      { from: owner }
    );
  });

  it("As any other address it fails to initialize external contracts addresses", async () => {
    const contract = await FlightSuretyApp.deployed();
    try {
      await contract.initialize(
        flightSuretyDataAddress,
        insuranceCoverageAmendmentProposalAddress,
        membershipFeeAmendmentProposalAddress,
        insuranceProviderRoleAddress,
        oracleProviderRoleAddress,
        flightSuretySharesAddress,
        { from: activatedInsuranceProviderOne }
      );
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be owner");
    }
  });

  /* external contracts calls management */

  it("As  owner of the contract should unauthorize a caller for FlightSuretyData", async () => {
    const contract = await FlightSuretyApp.deployed();
    await contract.updateAuthorizedCallerFlightSuretyData(
      authorizedCaller,
      false,
      { from: owner }
    );
    const eventLogsUnauth = await contract.getPastEvents("UnauthorizedCaller");
    assert.equal(eventLogsUnauth.length, 1);
  });

  it("As  owner of the contract should unauthorize a caller for FlightSuretyData", async () => {
    const contract = await FlightSuretyApp.deployed();
    await contract.updateAuthorizedCallerFlightSuretyData(
      authorizedCaller,
      true,
      { from: owner }
    );
    const eventLogsAuth = await contract.getPastEvents("AuthorizedCaller");
    assert.equal(eventLogsAuth.length, 1);
  });

  it("As caller not owner of the contract should fail to unauthorize a caller for FlightSuretyData", async () => {
    const contract = await FlightSuretyApp.deployed();
    try {
      await contract.updateAuthorizedCallerFlightSuretyData(
        authorizedCaller,
        false,
        { from: unauthorizedCaller }
      );
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be owner");
    }
  });

  it("As  owner of the contract should unauthorize a caller for InsuranceCoverageAmendmentProposal", async () => {
    const contract = await FlightSuretyApp.deployed();
    await contract.updateAuthorizedCallerInsuranceCoverageAmendmentProposal(
      authorizedCaller,
      false,
      { from: owner }
    );
    const eventLogsUnauth = await contract.getPastEvents("UnauthorizedCaller");
    assert.equal(eventLogsUnauth.length, 1);
  });

  it("As  owner of the contract should authorize a caller for InsuranceCoverageAmendmentProposal", async () => {
    const contract = await FlightSuretyApp.deployed();
    await contract.updateAuthorizedCallerInsuranceCoverageAmendmentProposal(
      authorizedCaller,
      true,
      { from: owner }
    );
    const eventLogsAuth = await contract.getPastEvents("AuthorizedCaller");
    assert.equal(eventLogsAuth.length, 1);
  });

  it("As caller not owner of the contract should fail to unauthorize a caller for InsuranceCoverageAmendmentProposal", async () => {
    const contract = await FlightSuretyApp.deployed();
    try {
      await contract.updateAuthorizedCallerInsuranceCoverageAmendmentProposal(
        authorizedCaller,
        false,
        { from: unauthorizedCaller }
      );
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be owner");
    }
  });

  it("As  owner of the contract should unauthorize a caller for MembershipFeeAmendmentProposal", async () => {
    const contract = await FlightSuretyApp.deployed();
    await contract.updateAuthorizedCallerMembershipFeeAmendmentProposal(
      authorizedCaller,
      false,
      { from: owner }
    );
    const eventLogsUnauth = await contract.getPastEvents("UnauthorizedCaller");
    assert.equal(eventLogsUnauth.length, 1);
  });

  it("As  owner of the contract should authorize a caller for MembershipFeeAmendmentProposal", async () => {
    const contract = await FlightSuretyApp.deployed();
    await contract.updateAuthorizedCallerMembershipFeeAmendmentProposal(
      authorizedCaller,
      true,
      { from: owner }
    );

    const eventLogsAuth = await contract.getPastEvents("AuthorizedCaller");
    assert.equal(eventLogsAuth.length, 1);
  });

  it("As caller not owner of the contract should fail to unauthorize a caller for MembershipFeeAmendmentProposal", async () => {
    const contract = await FlightSuretyApp.deployed();
    try {
      await contract.updateAuthorizedCallerMembershipFeeAmendmentProposal(
        authorizedCaller,
        false,
        { from: unauthorizedCaller }
      );
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be owner");
    }
  });

  it("As  owner of the contract should unauthorize a caller for InsuranceProviderRole", async () => {
    const contract = await FlightSuretyApp.deployed();
    await contract.updateAuthorizedCallerInsuranceProviderRole(
      authorizedCaller,
      false,
      { from: owner }
    );

    const eventLogsUnauth = await contract.getPastEvents("UnauthorizedCaller");
    assert.equal(eventLogsUnauth.length, 1);
  });

  it("As  owner of the contract should authorize a caller for InsuranceProviderRole", async () => {
    const contract = await FlightSuretyApp.deployed();
    await contract.updateAuthorizedCallerInsuranceProviderRole(
      authorizedCaller,
      true,
      { from: owner }
    );

    const eventLogsAuth = await contract.getPastEvents("AuthorizedCaller");

    assert.equal(eventLogsAuth.length, 1);
  });

  it("As caller not owner of the contract should fail to unauthorize a caller for InsuranceProviderRole", async () => {
    const contract = await FlightSuretyApp.deployed();
    try {
      await contract.updateAuthorizedCallerInsuranceProviderRole(
        authorizedCaller,
        false,
        { from: unauthorizedCaller }
      );
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be owner");
    }
  });

  it("As  owner of the contract should unauthorize a caller for OracleProviderRole", async () => {
    const contract = await FlightSuretyApp.deployed();
    await contract.updateAuthorizedCallerOracleProviderRole(
      authorizedCaller,
      false,
      { from: owner }
    );
    const eventLogsUnauth = await contract.getPastEvents("UnauthorizedCaller");
    assert.equal(eventLogsUnauth.length, 1);
  });

  it("As  owner of the contract should authorize a caller for OracleProviderRole", async () => {
    const contract = await FlightSuretyApp.deployed();
    await contract.updateAuthorizedCallerOracleProviderRole(
      authorizedCaller,
      true,
      { from: owner }
    );

    const eventLogsAuth = await contract.getPastEvents("AuthorizedCaller");
    assert.equal(eventLogsAuth.length, 1);
  });

  it("As caller not owner of the contract should fail to unauthorize a caller for OracleProviderRole", async () => {
    const contract = await FlightSuretyApp.deployed();
    try {
      await contract.updateAuthorizedCallerOracleProviderRole(
        authorizedCaller,
        false,
        { from: unauthorizedCaller }
      );
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be owner");
    }
  });

  it("As  owner of the contract should unauthorize a caller for FlighSuretyShares", async () => {
    const contract = await FlightSuretyApp.deployed();
    await contract.updateAuthorizedCallerFlighSuretyShares(
      authorizedCaller,
      false,
      { from: owner }
    );
    const eventLogsUnauth = await contract.getPastEvents("UnauthorizedCaller");
    assert.equal(eventLogsUnauth.length, 1);
  });

  it("As  owner of the contract should authorize a caller for FlighSuretyShares", async () => {
    const contract = await FlightSuretyApp.deployed();
    await contract.updateAuthorizedCallerFlighSuretyShares(
      authorizedCaller,
      true,
      { from: owner }
    );
    const eventLogsAuth = await contract.getPastEvents("AuthorizedCaller");

    assert.equal(eventLogsAuth.length, 1);
  });

  it("As caller not owner of the contract should fail to unauthorize a caller for FlighSuretyShares", async () => {
    const contract = await FlightSuretyApp.deployed();
    try {
      await contract.updateAuthorizedCallerFlighSuretyShares(
        authorizedCaller,
        true,
        { from: unauthorizedCaller }
      );
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be owner");
    }
  });

  /* providers registrations */

  // insurance providers

  it("should register an insurance provider providing the correct fee and activate it according specific rules", async () => {
    const contract = await FlightSuretyApp.deployed();
    await Promise.all(
      [
        activatedInsuranceProviderOne,
        activatedInsuranceProviderTwo,
        activatedInsuranceProviderThree,
        registeredInsuranceProviderOne,
        registeredInsuranceProviderTwo,
      ].map(
        async (user) =>
          await contract.registerInsuranceProvider({
            from: user,
            value: web3.utils.toWei("10"),
          })
      )
    );
    const eventLogsRegisteredUserOne = await contract.getPastEvents(
      "RegisteredInsuranceProvider",
      {
        fromBlock: 0,
        filter: { insuranceProvider: activatedInsuranceProviderOne },
      }
    );
    const eventLogsActivatedUserOne = await contract.getPastEvents(
      "ActivatedInsuranceProvider",
      {
        fromBlock: 0,
        filter: { insuranceProvider: activatedInsuranceProviderOne },
      }
    );
    const eventLogsRegisteredUserFive = await contract.getPastEvents(
      "RegisteredInsuranceProvider",
      {
        fromBlock: 0,
        filter: { insuranceProvider: registeredInsuranceProviderTwo },
      }
    );
    const eventLogsActivatedUserFive = await contract.getPastEvents(
      "ActivatedInsuranceProvider",
      {
        fromBlock: 0,
        filter: { insuranceProvider: registeredInsuranceProviderTwo },
      }
    );
    assert.equal(eventLogsRegisteredUserOne.length, 1);
    assert.equal(eventLogsActivatedUserOne.length, 1);
    assert.equal(eventLogsRegisteredUserFive.length, 1);
    assert.equal(eventLogsActivatedUserFive.length, 0);
  });

  it("should fail to register an insurance provider providing the incorrect fee", async () => {
    const contract = await FlightSuretyApp.deployed();
    try {
      await contract.registerInsuranceProvider({
        from: activatedInsuranceProviderOne,
        value: web3.utils.toWei("1"),
      });
    } catch (error) {
      assert.equal(error.reason, "incorrect fee sent to contract");
    }
  });

  // oracle providers
  it("should register an oracle provider providing the correct fee and activate it according specific rules", async () => {
    const contract = await FlightSuretyApp.deployed();
    await Promise.all(
      [
        registeredInsuranceProviderTwo,
        activatedOracleProviderOne,
        activatedOracleProviderTwo,
        activatedOracleProviderThree,
        registeredOracleProviderOne,
      ].map(
        async (user) =>
          await contract.registerOracleProvider({
            from: user,
            value: web3.utils.toWei("10"),
          })
      )
    );
    const eventLogsRegisteredUserSix = await contract.getPastEvents(
      "RegisteredOracleProvider",
      { fromBlock: 0, filter: { oracleProvider: activatedOracleProviderOne } }
    );
    const eventLogsActivatedUserSix = await contract.getPastEvents(
      "ActivatedOracleProvider",
      { fromBlock: 0, filter: { oracleProvider: activatedOracleProviderOne } }
    );
    const eventLogsRegisteredUserNine = await contract.getPastEvents(
      "RegisteredOracleProvider",
      { fromBlock: 0, filter: { oracleProvider: registeredOracleProviderOne } }
    );
    const eventLogsActivatedUserNine = await contract.getPastEvents(
      "ActivatedOracleProvider",
      { fromBlock: 0, filter: { oracleProvider: registeredOracleProviderOne } }
    );
    assert.equal(eventLogsRegisteredUserSix.length, 1);
    assert.equal(eventLogsActivatedUserSix.length, 1);
    assert.equal(eventLogsRegisteredUserNine.length, 1);
    assert.equal(eventLogsActivatedUserNine.length, 0);
  });
  it("should fail to register an oracle provider providing the incorrect fee", async () => {
    const contract = await FlightSuretyApp.deployed();
    try {
      await contract.registerOracleProvider({
        from: activatedOracleProviderOne,
        value: web3.utils.toWei("1"),
      });
    } catch (error) {
      assert.equal(error.reason, "incorrect fee sent to contract");
    }
  });

  /* votes providers */

  // insurance providers

  it("should vote an insurance provider membership and activate votee account if consensus has been reached", async () => {
    const contract = await FlightSuretyApp.deployed();
    await Promise.all(
      [
        activatedInsuranceProviderOne,
        activatedInsuranceProviderTwo,
        activatedInsuranceProviderThree,
      ].map(async (voter) => {
        await contract.voteInsuranceProviderMembership(
          registeredInsuranceProviderTwo,
          {
            from: voter,
          }
        );
      })
    );
    const eventLogsVote = await contract.getPastEvents(
      "NewVoteInsuranceProvider",
      { fromBlock: 0, filter: { votee: registeredInsuranceProviderTwo } }
    );
    const eventLogsActivatedUserFive = await contract.getPastEvents(
      "ActivatedInsuranceProvider",
      {
        fromBlock: 0,
        filter: { insuranceProvider: registeredInsuranceProviderTwo },
      }
    );
    assert.equal(eventLogsVote.length, 3);
    assert.equal(eventLogsActivatedUserFive.length, 1);
  });

  it("should fail to vote an insurance provider membership if caller has already voted", async () => {
    const contract = await FlightSuretyApp.deployed();
    try {
      await contract.voteInsuranceProviderMembership(
        registeredInsuranceProviderTwo,
        {
          from: activatedInsuranceProviderOne,
        }
      );
    } catch (error) {
      assert.equal(error.reason, "caller has already voted");
    }
  });

  it("should fail to vote an insurance provider membership if caller is not token holder", async () => {
    const contract = await FlightSuretyApp.deployed();
    try {
      await contract.voteInsuranceProviderMembership(
        registeredInsuranceProviderTwo,
        {
          from: registeredInsuranceProviderOne,
        }
      );
    } catch (error) {
      assert.equal(error.reason, "caller must be token holder");
    }
  });

  // oracle providers

  it("should vote an oracle provider membership and activate votee account if consensus has been reached", async () => {
    const contract = await FlightSuretyApp.deployed();
    await Promise.all(
      [
        activatedOracleProviderOne,
        activatedOracleProviderTwo,
        activatedOracleProviderThree,
      ].map(async (voter) => {
        await contract.voteOracleProviderMembership(
          registeredInsuranceProviderTwo,
          {
            from: voter,
          }
        );
      })
    );
    const eventLogsVote = await contract.getPastEvents(
      "NewVoteOracleProvider",
      { fromBlock: 0, filter: { votee: registeredInsuranceProviderTwo } }
    );
    const eventLogsActivatedUserFive = await contract.getPastEvents(
      "ActivatedOracleProvider",
      {
        fromBlock: 0,
        filter: { oracleProvider: registeredInsuranceProviderTwo },
      }
    );
    assert.equal(eventLogsVote.length, 3);
    assert.equal(eventLogsActivatedUserFive.length, 1);
  });

  it("should fail to vote an oracle provider membership if caller has already voted", async () => {
    const contract = await FlightSuretyApp.deployed();
    try {
      await contract.voteOracleProviderMembership(
        registeredInsuranceProviderTwo,
        {
          from: activatedInsuranceProviderOne,
        }
      );
    } catch (error) {
      assert.equal(error.reason, "caller has already voted");
    }
  });

  it("should fail to vote an oracle provider membership if caller is not token holder", async () => {
    const contract = await FlightSuretyApp.deployed();
    try {
      await contract.voteOracleProviderMembership(
        registeredInsuranceProviderTwo,
        {
          from: registeredOracleProviderOne,
        }
      );
    } catch (error) {
      assert.equal(error.reason, "caller must be token holder");
    }
  });

  /* flights management */

  it("should register a new flight if caller is activated insurance provider", async () => {
    const contract = await FlightSuretyApp.deployed();
    await contract.registerFlight(
      flightRef,
      estimatedDeparture,
      estimatedArrival,
      rate,
      {
        from: activatedInsuranceProviderOne,
      }
    );

    const eventLogs = await contract.getPastEvents("NewFlight", {
      fromBlock: 0,
      filter: { insuranceProvider: activatedInsuranceProviderOne },
    });
    assert.equal(eventLogs.length, 1);
  });

  it("should fail to register a new flight if caller is not an activated insurance provider", async () => {
    const contract = await FlightSuretyApp.deployed();
    try {
      await contract.registerFlight(
        flightRef,
        estimatedDeparture,
        estimatedArrival,
        rate,
        {
          from: registeredInsuranceProviderOne,
        }
      );
    } catch (error) {
      assert.equal(error.reason, "caller must be activated insurance provider");
    }
  });

  it("should fail to register a new flight if flight is not valid due to invalid departure and arrival dates", async () => {
    const contract = await FlightSuretyApp.deployed();
    try {
      await contract.registerFlight(
        flightRef,
        invalidEstimatedDeparture,
        invalidEstimatedArrival,
        rate,
        {
          from: activatedInsuranceProviderOne,
        }
      );
    } catch (error) {
      assert.equal(error.reason, "flight must be valid");
    }
  });

  it("should fail to register a new flight if flight is not valid due to invalid rate", async () => {
    const contract = await FlightSuretyApp.deployed();
    try {
      await contract.registerFlight(
        flightRef,
        invalidEstimatedDeparture,
        invalidEstimatedArrival,
        rate,
        {
          from: activatedInsuranceProviderOne,
        }
      );
    } catch (error) {
      assert.equal(error.reason, "flight must be valid");
    }
  });

  it("should fail to register a new flight if flight is not valid due to invalid departure and arrival dates departure greater than arrival date", async () => {
    const contract = await FlightSuretyApp.deployed();
    try {
      await contract.registerFlight(
        flightRef,
        parseInt((Date.now() + 3600 * 24 * 1000).toString().slice(0, -3)),
        parseInt((Date.now() - 3600 * 24 * 1000).toString().slice(0, -3)),
        rate,
        {
          from: activatedInsuranceProviderOne,
        }
      );
    } catch (error) {
      assert.equal(error.reason, "flight must be valid");
    }
  });

  /* insurances management */
  it("should register a new insurance", async () => {
    const contract = await FlightSuretyApp.deployed();
    await contract.registerInsurance(flightID, {
      from: activatedInsuranceProviderOne,
      value: rate,
    });

    const eventLogs = await contract.getPastEvents("NewInsurance", {
      fromBlock: 0,
      filter: { passenger: activatedInsuranceProviderOne },
    });
    assert.equal(eventLogs.length, 1);
  });

  it("should fail to register a new insurance if message value does not match flight rate", async () => {
    const contract = await FlightSuretyApp.deployed();
    try {
      await contract.registerInsurance(flightID, {
        from: activatedInsuranceProviderOne,
        value: rate - 1,
      });
    } catch (error) {
      assert.equal(error.reason, "sent value does not match flight rate");
    }
  });

  it("should fail to register a new insurance total insured value coverage is not sufficient to cover new insurance value", async () => {
    const contract = await FlightSuretyApp.deployed();
    const flightSuretyData = await FlightSuretyData.at(flightSuretyDataAddress);
    // dummy caller to access the function and set the total insured value to 0 in order to fail the test
    await flightSuretyData.authorizeCaller(authorizedCaller, { from: owner });
    await flightSuretyData.setTotalInsuredValue(0, { from: authorizedCaller });
    try {
      await contract.registerInsurance(flightID, {
        from: activatedInsuranceProviderOne,
        value: rate,
      });
    } catch (error) {
      assert.equal(
        error.reason,
        "current funds must cover new insurance value"
      );
    }
  });

  it("should fail to register a new insurance if flight is not future", async () => {
    const contract = await FlightSuretyApp.deployed();
    const flightSuretyData = await FlightSuretyData.at(flightSuretyDataAddress);
    // dummy caller to access the functions in flightSuretyData
    await flightSuretyData.authorizeCaller(authorizedCaller, { from: owner });
    // reset the total insured value to the proper one
    await flightSuretyData.setTotalInsuredValue(rate, {
      from: authorizedCaller,
    });
    // registering a flight in the past
    await flightSuretyData.registerFlight(
      activatedInsuranceProviderOne,
      flightRef,
      (Date.now() - 3600 * 24 * 10 * 1000).toString().slice(0, -3),
      (Date.now() - 3600 * 24 * 9 * 1000).toString().slice(0, -3),
      rate,
      {
        from: authorizedCaller,
      }
    );
    try {
      await contract.registerInsurance(2, {
        from: activatedInsuranceProviderOne,
      });
    } catch (error) {
      assert.equal(error.reason, "flight departure must be future");
    }
  });

  it("should fail to claim the insurance of a given user if caller is not owner of the insurance", async () => {
    const contract = await FlightSuretyApp.deployed();
    const flightSuretyData = await FlightSuretyData.at(flightSuretyDataAddress);
    // dummy caller to access the function and update the flight data in order to claim the insurance
    await flightSuretyData.authorizeCaller(authorizedCaller, { from: owner });
    // update the flight data in order to claim the insurance
    await flightSuretyData.updateFlight(
      flightID,
      estimatedDeparture,
      estimatedArrival + 3600 * 2,
      true,
      { from: authorizedCaller }
    );
    try {
      await contract.claimInsurance(1, { from: activatedOracleProviderOne });
    } catch (error) {
      assert.equal(error.reason, "caller must be insurance owner");
    }
  });

  it("should fail to claim the insurance of a given user if flight is not late", async () => {
    const contract = await FlightSuretyApp.deployed();
    const flightSuretyData = await FlightSuretyData.at(flightSuretyDataAddress);
    // dummy caller to access the function and update the flight data in order to claim the insurance
    await flightSuretyData.authorizeCaller(authorizedCaller, { from: owner });
    // update the flight data in order to claim the insurance
    await flightSuretyData.updateFlight(
      flightID,
      estimatedDeparture,
      estimatedArrival,
      false,
      { from: authorizedCaller }
    );
    try {
      await contract.claimInsurance(1, { from: activatedInsuranceProviderOne });
    } catch (error) {
      assert.equal(error.reason, "flight must be late");
    }
  });

  it("should claim the insurance of a given user if caller is owner of the insurance", async () => {
    const contract = await FlightSuretyApp.deployed();
    const flightSuretyData = await FlightSuretyData.at(flightSuretyDataAddress);
    // dummy caller to access the function and update the flight data in order to claim the insurance
    await flightSuretyData.authorizeCaller(authorizedCaller, { from: owner });
    // update the flight data in order to claim the insurance
    await flightSuretyData.updateFlight(
      flightID,
      estimatedDeparture,
      estimatedArrival + 3600 * 2,
      true,
      { from: authorizedCaller }
    );
    const beforeClaimBalance = await web3.eth.getBalance(
      activatedInsuranceProviderOne
    );
    await contract.claimInsurance(1, { from: activatedInsuranceProviderOne });
    const afterClaimBalance = await web3.eth.getBalance(
      activatedInsuranceProviderOne
    );
    const eventLogs = await contract.getPastEvents("NewPayout", {
      fromBlock: 0,
      filter: { flightID: flightID, owner: activatedInsuranceProviderOne },
    });
    assert.equal(eventLogs.length, 1);
    console.log(
      web3.utils.fromWei(afterClaimBalance, "ether"),
      web3.utils.fromWei(beforeClaimBalance, "ether")
    );
    assert.equal(
      new BigNumber(afterClaimBalance).isGreaterThan(
        new BigNumber(beforeClaimBalance)
      ),
      true
    );
  });

  it("should fail to claim the insurance of a given user if insurance has already been claimed", async () => {
    const contract = await FlightSuretyApp.deployed();
    try {
      await contract.claimInsurance(1, { from: activatedInsuranceProviderOne });
    } catch (error) {
      assert.equal(error.reason, "insurance must not have been claimed");
    }
  });

  /* Settings amendment proposals*/

  // membership fee amendment proposals

  it("should return the current membership fee", async () => {
    const contract = await FlightSuretyApp.deployed();
    const fee = await contract.currentMembershipFee({
      from: unauthorizedCaller,
    });
    assert.equal(fee > 0, true);
  });

  it("As a token holder register a new membership amendment proposal", async () => {
    const contract = await FlightSuretyApp.deployed();
    await contract.registerMembershipFeeAmendmentProposal(
      web3.utils.toWei("15"),
      { from: activatedInsuranceProviderOne }
    );
    await contract.registerMembershipFeeAmendmentProposal(
      web3.utils.toWei("20"),
      { from: activatedOracleProviderOne }
    );

    const eventLogsProposalOne = await contract.getPastEvents(
      "NewMembershipFeeAmendmentProposal",
      { fromBlock: 0, filter: { proposalID: 1 } }
    );
    const eventLogsProposalTwo = await contract.getPastEvents(
      "NewMembershipFeeAmendmentProposal",
      { fromBlock: 0, filter: { proposalID: 2 } }
    );
    assert.equal(eventLogsProposalOne.length, 1);
    assert.equal(eventLogsProposalTwo.length, 1);
  });

  it("As a non token holder should fail to register a new membership amendment proposal", async () => {
    const contract = await FlightSuretyApp.deployed();
    try {
      await contract.registerMembershipFeeAmendmentProposal(
        web3.utils.toWei("15"),
        { from: registeredInsuranceProviderOne }
      );
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be token holder");
    }

    try {
      await contract.registerMembershipFeeAmendmentProposal(
        web3.utils.toWei("15"),
        { from: registeredOracleProviderOne }
      );
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be token holder");
    }
  });

  it("As a token holder vote an existing membership fee amendment proposal", async () => {
    const contract = await FlightSuretyApp.deployed();
    await contract.voteMembershipFeeAmendmentProposal(1, {
      from: activatedInsuranceProviderTwo,
    });
    await contract.voteMembershipFeeAmendmentProposal(2, {
      from: activatedOracleProviderTwo,
    });

    const eventLogsVoteOne = await contract.getPastEvents(
      "NewVoteMembershipFeeAmendmentProposal",
      { fromBlock: 0, filter: { proposalID: 1 } }
    );
    const eventLogsVoteTwo = await contract.getPastEvents(
      "NewVoteMembershipFeeAmendmentProposal",
      { fromBlock: 0, filter: { proposalID: 2 } }
    );
    assert.equal(eventLogsVoteOne.length, 2);
    assert.equal(eventLogsVoteTwo.length, 2);
  });

  it("As a non token holder should fail to vote an existing membership fee amendment proposal", async () => {
    const contract = await FlightSuretyApp.deployed();
    try {
      await contract.voteMembershipFeeAmendmentProposal(1, {
        from: registeredOracleProviderOne,
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be token holder");
    }

    try {
      await contract.voteMembershipFeeAmendmentProposal(1, {
        from: registeredInsuranceProviderOne,
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be token holder");
    }
  });

  // insurance coverage amendment proposal

  it("should return the current insurance coverage ratio", async () => {
    const contract = await FlightSuretyApp.deployed();
    const ratio = await contract.currentInsuranceCoverageRatio({
      from: unauthorizedCaller,
    });
    assert.equal(ratio > 0, true);
  });

  it("As a token holder register a new membership amendment proposal", async () => {
    const contract = await FlightSuretyApp.deployed();
    await contract.registerInsuranceCoverageAmendmentProposal(200, {
      from: activatedInsuranceProviderOne,
    });
    await contract.registerInsuranceCoverageAmendmentProposal(200, {
      from: activatedOracleProviderOne,
    });
    const eventLogsProposalOne = await contract.getPastEvents(
      "NewInsuranceCoverageAmendmentProposal",
      { fromBlock: 0, filter: { proposalID: 1 } }
    );
    const eventLogsProposalTwo = await contract.getPastEvents(
      "NewInsuranceCoverageAmendmentProposal",
      { fromBlock: 0, filter: { proposalID: 2 } }
    );
    assert.equal(eventLogsProposalOne.length, 1);
    assert.equal(eventLogsProposalTwo.length, 1);
  });

  it("As a non token holder should fail to register a new membership amendment proposal", async () => {
    const contract = await FlightSuretyApp.deployed();
    try {
      await contract.registerInsuranceCoverageAmendmentProposal(200, {
        from: registeredInsuranceProviderOne,
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be token holder");
    }
    try {
      await contract.registerInsuranceCoverageAmendmentProposal(200, {
        from: registeredOracleProviderOne,
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be token holder");
    }
  });

  it("As a token holder vote an existing insurance coverage amendement proposal", async () => {
    const contract = await FlightSuretyApp.deployed();
    await contract.voteInsuranceCoverageAmendmentProposal(1, {
      from: activatedInsuranceProviderTwo,
    });
    await contract.voteInsuranceCoverageAmendmentProposal(2, {
      from: activatedOracleProviderTwo,
    });

    const eventLogsVoteOne = await contract.getPastEvents(
      "NewVoteInsuranceCoverageAmendmentProposal",
      { fromBlock: 0, filter: { proposalID: 1 } }
    );
    const eventLogsVoteTwo = await contract.getPastEvents(
      "NewVoteInsuranceCoverageAmendmentProposal",
      { fromBlock: 0, filter: { proposalID: 2 } }
    );
    assert.equal(eventLogsVoteOne.length, 2);
    assert.equal(eventLogsVoteTwo.length, 2);
  });

  it("As a non token holder should fail to vote an existing insurance coverage amendement proposal", async () => {
    const contract = await FlightSuretyApp.deployed();
    try {
      await contract.voteInsuranceCoverageAmendmentProposal(1, {
        from: registeredInsuranceProviderOne,
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be token holder");
    }
    try {
      await contract.voteInsuranceCoverageAmendmentProposal(1, {
        from: registeredOracleProviderOne,
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be token holder");
    }
  });
});
