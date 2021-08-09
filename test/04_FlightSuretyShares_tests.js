const BigNumber = require("bignumber.js");
const assert = require("chai").assert;
const FlightSuretyShares = artifacts.require("FlightSuretyShares");

contract(FlightSuretyShares, async (accounts) => {
  const owner = accounts[0];
  const userOne = accounts[1];
  const userTwo = accounts[2];
  const authorizedCaller = accounts[3];
  const unauthorizedCaller = accounts[4];

  // contract call authorization management
  it("As owner of the contract should authorize a caller", async () => {
    const contract = await FlightSuretyShares.deployed();
    await contract.authorizeCaller(userOne, { from: owner });
    await contract.authorizeCaller(authorizedCaller, { from: owner });
  });

  it("As caller not owner of the contract should fail to authorize a caller", async () => {
    const contract = await FlightSuretyShares.deployed();
    try {
      await contract.authorizeCaller(userOne, { from: userTwo });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be owner or authorized caller");
    }
  });

  it("As  owner of the contract should unauthorize a caller ", async () => {
    const contract = await FlightSuretyShares.deployed();
    await contract.unauthorizeCaller(userOne, { from: owner });
  });

  it("As caller not owner of the contract should fail to unauthorize a caller ", async () => {
    const contract = await FlightSuretyShares.deployed();
    try {
      await contract.unauthorizeCaller(userOne, { from: userTwo });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be owner or authorized caller");
    }
  });

  // token minting
  it("As owner of the contract should mint tokens ", async () => {
    const contract = await FlightSuretyShares.deployed();
    await contract.mint(userOne, 1, { from: owner });
    let tokenSupply = await contract.totalSupply();
    assert.equal(new BigNumber(tokenSupply).isEqualTo(new BigNumber(1)), true);
  });

  it("As authorized caller of the contract should mint tokens ", async () => {
    const contract = await FlightSuretyShares.deployed();
    await contract.mint(userOne, 1, { from: authorizedCaller });
    let tokenSupply = await contract.totalSupply();
    assert.equal(new BigNumber(tokenSupply).isEqualTo(new BigNumber(2)), true);
  });

  it("As caller not owner of the contract should fail to mint tokens", async () => {
    const contract = await FlightSuretyShares.deployed();
    try {
      await contract.mint(userOne, 1, { from: unauthorizedCaller });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be owner or authorized caller");
    }
  });

  // token burning
  it("As owner of the contract should burn tokens ", async () => {
    const contract = await FlightSuretyShares.deployed();
    await contract.burn(userOne, 1, { from: owner });
    let tokenSupply = await contract.totalSupply();
    assert.equal(new BigNumber(tokenSupply).isEqualTo(new BigNumber(1)), true);
  });

  it("As authorized caller of the contract should burn tokens ", async () => {
    const contract = await FlightSuretyShares.deployed();
    await contract.burn(userOne, 1, { from: authorizedCaller });
    let tokenSupply = await contract.totalSupply();
    assert.equal(new BigNumber(tokenSupply).isEqualTo(new BigNumber(0)), true);
  });

  it("As caller not owner of the contract should fail to burn tokens", async () => {
    const contract = await FlightSuretyShares.deployed();
    try {
      await contract.burn(userOne, 1, { from: unauthorizedCaller });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be owner or authorized caller");
    }
  });
});
