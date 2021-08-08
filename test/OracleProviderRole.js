const BigNumber = require("bignumber.js");
const assert = require("chai").assert;
const OracleProviderRole = artifacts.require("OracleProviderRole");

contract(OracleProviderRole, async (accounts) => {
  const owner = accounts[0];
  const userOne = accounts[1];
  const userTwo = accounts[2];
  const authorizedCaller = accounts[3];
  const unauthorizedCaller = accounts[4];

  // contract call authorization management
  it("As owner of the contract should authorize a caller", async () => {
    let contract = await OracleProviderRole.deployed();
    await contract.authorizeCaller(userOne, { from: owner });
    await contract.authorizeCaller(authorizedCaller, { from: owner });
  });

  it("As caller not owner of the contract should fail to authorize a caller", async () => {
    let contract = await OracleProviderRole.deployed();
    try {
      await contract.authorizeCaller(userOne, { from: userTwo });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be owner or authorized caller");
    }
  });

  it("As  owner of the contract should unauthorize a caller ", async () => {
    let contract = await OracleProviderRole.deployed();
    await contract.unauthorizeCaller(userOne, { from: owner });
  });

  it("As caller not owner of the contract should fail to unauthorize a caller ", async () => {
    let contract = await OracleProviderRole.deployed();
    try {
      await contract.unauthorizeCaller(userOne, { from: userTwo });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be owner or authorized caller");
    }
  });

  /** oracle providers management (CHECK + ADD + REMOVE + VOTE) */

  // REGISTRATION

  it("As an authorized caller register an oracle provider", async () => {
    let contract = await OracleProviderRole.deployed();
    await contract.addOracleProvider(userOne, { from: authorizedCaller });
  });

  it("As an unauthorized caller should fail to register an oracle provider", async () => {
    let contract = await OracleProviderRole.deployed();
    try {
      await contract.addOracleProvider(userOne, { from: unauthorizedCaller });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be authorized");
    }
  });

  // READ REGISTRATION

  it("As an authorized caller checks if an oracle provider is registered", async () => {
    let contract = await OracleProviderRole.deployed();
    let bool = await contract.isRegisteredOracleProvider(userOne, {
      from: authorizedCaller,
    });
    assert.equal(bool, true);
  });

  it("As an unauthorized caller should fail to checks if an oracle provider is registered", async () => {
    let contract = await OracleProviderRole.deployed();
    try {
      await contract.isRegisteredOracleProvider(userOne, {
        from: unauthorizedCaller,
      });
      assert.fail();
    } catch (error) {
      assert.equal(
        error.message,
        "Returned error: VM Exception while processing transaction: revert caller must be authorized"
      );
    }
  });

  // READ REGISTERED PROVIDER COUNT

  it("As an authorized caller fetch current registered oracle provider count", async () => {
    let contract = await OracleProviderRole.deployed();
    let count = await contract.getRegisteredOracleProvidersCount({
      from: authorizedCaller,
    });
    assert.equal(new BigNumber(count).isEqualTo(new BigNumber(1)), true);
  });

  it("As an unauthorized caller should fail to fetch current registered oracle provider count", async () => {
    let contract = await OracleProviderRole.deployed();
    try {
      await contract.getRegisteredOracleProvidersCount({
        from: unauthorizedCaller,
      });
      assert.fail();
    } catch (error) {
      assert.equal(
        error.message,
        "Returned error: VM Exception while processing transaction: revert caller must be authorized"
      );
    }
  });

  // ACTIVATION

  it("As an authorized caller activate an oracle provider", async () => {
    let contract = await OracleProviderRole.deployed();
    await contract.activateOracleProvider(userOne, { from: authorizedCaller });
  });

  it("As an unauthorized caller should fail to activate an oracle provider", async () => {
    let contract = await OracleProviderRole.deployed();
    try {
      await contract.activateOracleProvider(userOne, {
        from: unauthorizedCaller,
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be authorized");
    }
  });

  // READ ACTIVATION

  it("As an authorized caller checks if an oracle provider is activated", async () => {
    let contract = await OracleProviderRole.deployed();
    let bool = await contract.isActivatedOracleProvider(userOne, {
      from: authorizedCaller,
    });
    assert.equal(bool, true);
  });

  it("As an unauthorized caller should fail to checks if an oracle provider is activated", async () => {
    let contract = await OracleProviderRole.deployed();
    try {
      await contract.isActivatedOracleProvider(userOne, {
        from: unauthorizedCaller,
      });
      assert.fail();
    } catch (error) {
      assert.equal(
        error.message,
        "Returned error: VM Exception while processing transaction: revert caller must be authorized"
      );
    }
  });

  // READ ACTIVATED PROVIDER COUNT

  it("As an authorized caller fetch current activated oracle provider count", async () => {
    let contract = await OracleProviderRole.deployed();
    let count = await contract.getActivatedOracleProvidersCount({
      from: authorizedCaller,
    });
    assert(new BigNumber(count).isEqualTo(new BigNumber(1)));
  });

  it("As an unauthorized caller should fail to fetch current activated oracle provider count", async () => {
    let contract = await OracleProviderRole.deployed();
    try {
      await contract.getActivatedOracleProvidersCount({
        from: unauthorizedCaller,
      });
      assert.fail();
    } catch (error) {
      assert.equal(
        error.message,
        "Returned error: VM Exception while processing transaction: revert caller must be authorized"
      );
    }
  });

  // VOTE PROVIDER MEMBERSHIP

  it("As an authorized caller  vote for an oracle provider activation and membership", async () => {
    let contract = await OracleProviderRole.deployed();
    contract.voteOracleProviderMembership(userTwo, userOne, 1, {
      from: authorizedCaller,
    });
  });

  it("As an unauthorized caller should fail to  vote for an oracle provider activation and membership", async () => {
    let contract = await OracleProviderRole.deployed();
    try {
      await contract.voteOracleProviderMembership(userTwo, userOne, 1, {
        from: unauthorizedCaller,
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be authorized");
    }
  });

  // READ VOTE

  it("As an authorized caller checks if a given caller has voted for the membership of an other address", async () => {
    let contract = await OracleProviderRole.deployed();
    let bool = await contract.hasVotedOracleProviderMembership(
      userOne,
      userTwo,
      {
        from: authorizedCaller,
      }
    );
    assert.equal(bool, true);
  });

  it("As an unauthorized caller should fail to checks if a given caller has voted for the membership of an other address", async () => {
    let contract = await OracleProviderRole.deployed();
    try {
      await contract.hasVotedOracleProviderMembership(userOne, userTwo, {
        from: unauthorizedCaller,
      });
      assert.fail();
    } catch (error) {
      assert.equal(
        error.message,
        "Returned error: VM Exception while processing transaction: revert caller must be authorized"
      );
    }
  });

  it("As an authorized caller get the current votes count for a given account", async () => {
    let contract = await OracleProviderRole.deployed();
    let count =
      await contract.getOracleProviderMembershipCurrentMembershipVotes(
        true,
        userOne,
        {
          from: authorizedCaller,
        }
      );

    assert.equal(new BigNumber(count).isEqualTo(new BigNumber(1)), true);
  });

  it("As an unauthorized caller should fail to get the current votes count for a given account", async () => {
    let contract = await OracleProviderRole.deployed();
    try {
      await contract.getOracleProviderMembershipCurrentMembershipVotes(
        true,
        userOne,
        {
          from: unauthorizedCaller,
        }
      );
      assert.fail();
    } catch (error) {
      assert.equal(
        error.message,
        "Returned error: VM Exception while processing transaction: revert caller must be authorized"
      );
    }
  });

  // READ CONSENSUS MEMBERSHIP

  it("As an authorized caller checks if an address currently voted for oracle provider membership has reached consensus among the community", async () => {
    let contract = await OracleProviderRole.deployed();
    let bool = await contract.hasReachedConsensusOracleProviderMembership(
      true,
      userOne,
      1,
      {
        from: authorizedCaller,
      }
    );
    assert.equal(bool, true);
  });

  it("As an unauthorized caller should fail to checks if an address currently voted for oracle provider membership has reached consensus among the community", async () => {
    let contract = await OracleProviderRole.deployed();
    try {
      await contract.hasReachedConsensusOracleProviderMembership(
        true,
        userOne,
        10,
        {
          from: unauthorizedCaller,
        }
      );
      assert.fail();
    } catch (error) {
      assert.equal(
        error.message,
        "Returned error: VM Exception while processing transaction: revert caller must be authorized"
      );
    }
  });

  // REMOVE PROVIDER

  it("As an authorized caller remove an existing oracle provider", async () => {
    let contract = await OracleProviderRole.deployed();
    await contract.renounceOracleProvider(userOne, { from: authorizedCaller });
  });

  it("As an unauthorized caller should fail to remove an existing oracle provider", async () => {
    let contract = await OracleProviderRole.deployed();
    try {
      await contract.renounceOracleProvider(userOne, {
        from: unauthorizedCaller,
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be authorized");
    }
  });
});
