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
const should = require("chai").should;
const FlightSuretyApp = artifacts.require("FlightSuretyApp");

// contract(FlightSuretyApp, async (accounts) => {
//   const owner = accounts[0];
// });

