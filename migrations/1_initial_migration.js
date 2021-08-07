const Migrations = artifacts.require("Migrations");

module.exports = function (deployer) {
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


/**
 
  Application workflow : 

      1- register an insurance provider through FlightSuretyApp contract
      2- register an oracle provider through FlightSuretyApp contract
      3- if insurance providers count is greater than 4 : vote the membership activation (all activated providers can vote)
      4- if oracle provider count is greater than 4 : vote the membership activation (all activated providers can vote)
      5- register a flight as an activated insurance provider through FlightSuretyApp contract
      6- register an insurance through FlightSuretyApp contract
      7- update flights data as oracle provider through FlightSuretyOracle contract
      8- claim the insurance if flight is late

      At any time as an insurance provider or an oracle provider I can as I have stake in the game :
      - register a membership fee amendment proposal
      - vote up an existing membership amendment proposal
      (the current membership fee will be updated when 50% of the participants have voted up the proposal thus reaching consensus among the involved actors)
      - register an insurance coverage amendment proposal
      - vote up an existing insurance coverage amendment proposal
      (the current insurance coverage will be updated when 50% of the participants have voted up the proposal thus reaching consensus among the involved actors)

      Every year (calculated as 365 days after the first contract deployment) token holders aka insurance and oracle providers 
      will be able during a week to burn their token in exchange for their respective share of the insurance funds profits;

      The FSS token will be scoped as a security token.

*/
 
  deployer.deploy(Migrations);
};
