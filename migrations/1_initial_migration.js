const fs = require("fs");
const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyOracle = artifacts.require("FlightSuretyOracle");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const FlightSuretyShares = artifacts.require("FlightSuretyShares");
const InsuranceProviderRole = artifacts.require("InsuranceProviderRole");
const OracleProviderRole = artifacts.require("OracleProviderRole");
const InsuranceCoverageAmendmentProposal = artifacts.require(
  "InsuranceCoverageAmendmentProposal"
);
const MembershipFeeAmendmentProposal = artifacts.require(
  "MembershipFeeAmendmentProposal"
);

/** 
  contracts deployement workflow :

      1- deploy FlightSuretyApp
      2- deploy FlightSuretyOracle
      3- deploy FlightSuretyData authorizing callers : 
        - address _appContractAddress 
        - address _oracleContractAddress
      4- deploy OracleProviderRole authorizing callers : 
        - address _appContractAddress 
        - address _oracleContractAddress
      5- deploy InsuranceProviderRole authorizing callers :
        - address _appContractAddress 
      6- deploy FlightSuretyShares authorizing callers : 
        - address _appContractAddress
      7- deploy InsuranceCoverageAmendmentProposal authroizing caller : 
        - address _appContractAddress
      8- deploy MembershipFeeAmendmentProposal authorizing caller :
        - address _appContractAddress
      7- initialize FlightSuretyApp referencing external contracts addresses : 
        - address _flightSuretyData
        - address _insuranceCoverageAmendmentProposal
        - address _membershipFeeAmendmentProposal
        - address _insuranceProviderRole
        - address _oracleProviderRole
        - address _flighSuretyShares
      8- initialize FlightSuretyOracle referencing external contracts addresses : 
        - address _flightSuretyData 
        - address _oracleProviderRole
*/

module.exports = async function (deployer, network, accounts) {
  const owner = accounts[0];

  // 1- deploy FlightSuretyApp setting contract vote settings :
  // - uint256 _tokenHolderMinBlockRequirement
  // - uint256 _proposalValidBlockNum
  await deployer.deploy(FlightSuretyApp, 2, 1000, { from: owner });
  const flightSuretyApp = await FlightSuretyApp.deployed();

  //2- deploy FlightSuretyOracle setting authorized flight delay :
  // - uint64 _authorizedFlightDelay
  await deployer.deploy(FlightSuretyOracle, 3600, { from: owner });
  const flightSuretyOracle = await FlightSuretyOracle.deployed();

  //3- deploy FlightSuretyData authorizing callers :
  //  - address _appContractAddress
  //  - address _oracleContractAddress
  await deployer.deploy(
    FlightSuretyData,
    flightSuretyApp.address,
    flightSuretyOracle.address,
    { from: owner }
  );
  const flightSuretyData = await FlightSuretyData.deployed();

  //4- deploy OracleProviderRole authorizing callers :
  //  - address _appContractAddress
  //  - address _oracleContractAddress
  await deployer.deploy(
    OracleProviderRole,
    flightSuretyApp.address,
    flightSuretyOracle.address,
    { from: owner }
  );
  const oracleProviderRole = await OracleProviderRole.deployed();

  //5- deploy InsuranceProviderRole authorizing callers :
  //  - address _appContractAddress
  await deployer.deploy(InsuranceProviderRole, flightSuretyApp.address, {
    from: owner,
  });
  const insuranceProviderRole = await InsuranceProviderRole.deployed();

  //6- deploy FlightSuretyShares authorizing callers :
  //  - address _appContractAddress
  await deployer.deploy(FlightSuretyShares, flightSuretyApp.address, {
    from: owner,
  });
  const flightSuretyShares = await FlightSuretyShares.deployed();

  //7- deploy InsuranceCoverageAmendmentProposal authroizing caller and setting current insurance coverage ratio to 150 aka 1.5x :
  //  - address _appContractAddress
  // - uint256  _currentInsuranceCoverage
  await deployer.deploy(
    InsuranceCoverageAmendmentProposal,
    flightSuretyApp.address,
    150,
    { from: owner }
  );
  const insuranceCoverageAmendmentProposal =
    await InsuranceCoverageAmendmentProposal.deployed();

  //8- deploy MembershipFeeAmendmentProposal authorizing caller and setting current membership fee to 10 ether:
  //  - address _appContractAddress
  //  - uint256 _currentMembershipfee
  await deployer.deploy(
    MembershipFeeAmendmentProposal,
    flightSuretyApp.address,
    web3.utils.toWei("10", "ether"),
    { from: owner }
  );
  const membershipFeeAmendmentProposal =
    await MembershipFeeAmendmentProposal.deployed();

  // //9- initialize FlightSuretyApp referencing external contracts addresses :
  // //  - address _flightSuretyData
  // //  - address _insuranceCoverageAmendmentProposal
  // //  - address _membershipFeeAmendmentProposal
  // //  - address _insuranceProviderRole
  // //  - address _oracleProviderRole
  // //  - address _flighSuretyShares
  await flightSuretyApp.initialize(
    flightSuretyData.address,
    insuranceCoverageAmendmentProposal.address,
    membershipFeeAmendmentProposal.address,
    insuranceProviderRole.address,
    oracleProviderRole.address,
    flightSuretyShares.address,
    { from: owner }
  );

  console.log(
    "========================================================================================="
  );
  console.log(`FlightSuretyApp succesfully initialized`);
  console.log(
    "========================================================================================="
  );

  //10- initialize FlightSuretyOracle referencing external contracts addresses :
  //  - address _flightSuretyData
  //  - address _oracleProviderRole
  await flightSuretyOracle.initialize(
    flightSuretyData.address,
    oracleProviderRole.address,
    { from: owner }
  );

  console.log(
    "========================================================================================="
  );
  console.log(`FlightSuretyOracle succesfully initialized`);
  console.log(
    "========================================================================================="
  );

  // copying contract abi to client directory

  const deployedContractNames = [
    "FlightSuretyApp",
    "FlightSuretyOracle",
    "FlightSuretyShares",
  ];

  deployedContractNames.map((filename) => {
    const data = fs.readFileSync(
      process.cwd() + "/build/contracts/" + filename + ".json"
    );
    fs.writeFileSync(
      process.cwd() + "/client/src/contracts/" + filename + ".json",
      data
    );
  });
};
