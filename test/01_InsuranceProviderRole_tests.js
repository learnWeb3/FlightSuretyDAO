const BigNumber = require("bignumber.js");
const assert = require("chai").assert;
const InsuranceProviderRole = artifacts.require("InsuranceProviderRole");

contract(InsuranceProviderRole, async (accounts) => {
  const owner = accounts[0];
  const userOne = accounts[1];
  const userTwo = accounts[2];
  const authorizedCaller = accounts[3];
  const unauthorizedCaller = accounts[4];
  // contract call authorization management
  it("As owner of the contract should authorize a caller", async () => {
    let contract = await InsuranceProviderRole.deployed();
    await contract.authorizeCaller(userOne, { from: owner });
    await contract.authorizeCaller(authorizedCaller, { from: owner });
  });

  it("As caller not owner of the contract should fail to authorize a caller", async () => {
    let contract = await InsuranceProviderRole.deployed();
    try {
      await contract.authorizeCaller(userOne, { from: userTwo });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be owner or authorized caller");
    }
  });

  it("As  owner of the contract should unauthorize a caller ", async () => {
    let contract = await InsuranceProviderRole.deployed();
    await contract.unauthorizeCaller(userOne, { from: owner });
  });

  it("As caller not owner of the contract should fail to unauthorize a caller ", async () => {
    let contract = await InsuranceProviderRole.deployed();
    try {
      await contract.unauthorizeCaller(userOne, { from: userTwo });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be owner or authorized caller");
    }
  });

  /** insurance providers management (CHECK + ADD + REMOVE + VOTE) */

  // REGISTRATION

  it("As an authorized caller register an insurance provider", async () => {
    let contract = await InsuranceProviderRole.deployed();
    await contract.addInsuranceProvider(userOne, { from: authorizedCaller });
  });

  it("As an unauthorized caller should fail to register an insurance provider", async () => {
    let contract = await InsuranceProviderRole.deployed();
    try {
      await contract.addInsuranceProvider(userOne, {
        from: unauthorizedCaller,
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be authorized");
    }
  });

  // READ REGISTRATION

  it("As an authorized caller checks if an insurance provider is registered", async () => {
    let contract = await InsuranceProviderRole.deployed();
    let bool = await contract.isRegisteredInsuranceProvider(userOne, {
      from: authorizedCaller,
    });
    assert.equal(bool, true);
  });

  it("As an unauthorized caller should fail to checks if an insurance provider is registered", async () => {
    let contract = await InsuranceProviderRole.deployed();
    try {
      await contract.isRegisteredInsuranceProvider(userOne, {
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

  it("As an authorized caller fetch current registered insurance provider count", async () => {
    let contract = await InsuranceProviderRole.deployed();
    let count = await contract.getRegisteredInsuranceProvidersCount({
      from: authorizedCaller,
    });
    assert.equal(new BigNumber(count).isEqualTo(new BigNumber(2)), true);
  });

  it("As an unauthorized caller should fail to fetch current registered insurance provider count", async () => {
    let contract = await InsuranceProviderRole.deployed();
    try {
      await contract.getRegisteredInsuranceProvidersCount({
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

  it("As an authorized caller activate an insurance provider", async () => {
    let contract = await InsuranceProviderRole.deployed();
    await contract.activateInsuranceProvider(userOne, {
      from: authorizedCaller,
    });
  });

  it("As an unauthorized caller should fail to activate an insurance provider", async () => {
    let contract = await InsuranceProviderRole.deployed();
    try {
      await contract.activateInsuranceProvider(userOne, {
        from: unauthorizedCaller,
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be authorized");
    }
  });

  // READ ACTIVATION

  it("As an authorized caller checks if an insurance provider is activated", async () => {
    let contract = await InsuranceProviderRole.deployed();
    let bool = await contract.isActivatedInsuranceProvider(userOne, {
      from: authorizedCaller,
    });
    assert.equal(bool, true);
  });

  it("As an unauthorized caller should fail to checks if an insurance provider is activated", async () => {
    let contract = await InsuranceProviderRole.deployed();
    try {
      await contract.isActivatedInsuranceProvider(userOne, {
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

  it("As an authorized caller fetch current activated insurance provider count", async () => {
    let contract = await InsuranceProviderRole.deployed();
    let count = await contract.getActivatedInsuranceProvidersCount({
      from: authorizedCaller,
    });
    assert.equal(new BigNumber(count).isEqualTo(new BigNumber(2)), true);
  });

  it("As an unauthorized caller should fail to fetch current activated insurance provider count", async () => {
    let contract = await InsuranceProviderRole.deployed();
    try {
      await contract.getActivatedInsuranceProvidersCount({
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

  it("As an authorized caller  vote for an insurance provider activation and membership", async () => {
    let contract = await InsuranceProviderRole.deployed();
    contract.voteInsuranceProviderMembership(userTwo, userOne, 1, {
      from: authorizedCaller,
    });
  });

  it("As an unauthorized caller should fail to  vote for an insurance provider activation and membership", async () => {
    let contract = await InsuranceProviderRole.deployed();
    try {
      await contract.voteInsuranceProviderMembership(userTwo, userOne, 1, {
        from: unauthorizedCaller,
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be authorized");
    }
  });

  // READ VOTE

  it("As an authorized caller checks if a given caller has voted for the membership of an other address", async () => {
    let contract = await InsuranceProviderRole.deployed();
    let bool = await contract.hasVotedInsuranceProviderMembership(
      userOne,
      userTwo,
      {
        from: authorizedCaller,
      }
    );
    assert.equal(bool, true);
  });

  it("As an unauthorized caller should fail to checks if a given caller has voted for the membership of an other address", async () => {
    let contract = await InsuranceProviderRole.deployed();
    try {
      await contract.hasVotedInsuranceProviderMembership(userOne, userTwo, {
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
    let contract = await InsuranceProviderRole.deployed();
    let count =
      await contract.getInsuranceProviderMembershipCurrentMembershipVotes(
        true,
        userOne,
        {
          from: authorizedCaller,
        }
      );

    assert(new BigNumber(count).isEqualTo(new BigNumber(1)));
  });

  it("As an unauthorized caller should fail to get the current votes count for a given account", async () => {
    let contract = await InsuranceProviderRole.deployed();
    try {
      await contract.getInsuranceProviderMembershipCurrentMembershipVotes(
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

  it("As an authorized caller checks if an address currently voted for insurance provider membership has reached consensus among the community", async () => {
    let contract = await InsuranceProviderRole.deployed();
    let bool = await contract.hasReachedConsensusInsuranceProviderMembership(
      true,
      userOne,
      1,
      {
        from: authorizedCaller,
      }
    );
    assert.equal(bool, true);
  });

  it("As an unauthorized caller should fail to checks if an address currently voted for insurance provider membership has reached consensus among the community", async () => {
    let contract = await InsuranceProviderRole.deployed();
    try {
      await contract.hasReachedConsensusInsuranceProviderMembership(
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

  it("As an authorized caller remove an existing insurance provider", async () => {
    let contract = await InsuranceProviderRole.deployed();
    await contract.renounceInsuranceProvider(userOne, {
      from: authorizedCaller,
    });
  });

  it("As an unauthorized caller should fail to remove an existing insurance provider", async () => {
    let contract = await InsuranceProviderRole.deployed();
    try {
      await contract.renounceInsuranceProvider(userOne, {
        from: unauthorizedCaller,
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be authorized");
    }
  });
});
