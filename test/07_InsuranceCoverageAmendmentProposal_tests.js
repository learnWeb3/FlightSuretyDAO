const BigNumber = require("bignumber.js");
const assert = require("chai").assert;
const InsuranceCoverageAmendmentProposal = artifacts.require(
  "InsuranceCoverageAmendmentProposal"
);

contract(InsuranceCoverageAmendmentProposal, async (accounts) => {
  const owner = accounts[0];
  const userOne = accounts[1];
  const userTwo = accounts[2];
  const authorizedCaller = accounts[3];
  const unauthorizedCaller = accounts[4];

  // contract call authorization management
  it("As owner of the contract should authorize a caller", async () => {
    let contract = await InsuranceCoverageAmendmentProposal.deployed();
    await contract.authorizeCaller(userOne, { from: owner });
    await contract.authorizeCaller(authorizedCaller, { from: owner });
  });

  it("As caller not owner of the contract should fail to authorize a caller", async () => {
    let contract = await InsuranceCoverageAmendmentProposal.deployed();
    try {
      await contract.authorizeCaller(userOne, { from: userTwo });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be owner or authorized caller");
    }
  });

  it("As  owner of the contract should unauthorize a caller ", async () => {
    let contract = await InsuranceCoverageAmendmentProposal.deployed();
    await contract.unauthorizeCaller(userOne, { from: owner });
  });

  it("As caller not owner of the contract should fail to unauthorize a caller ", async () => {
    let contract = await InsuranceCoverageAmendmentProposal.deployed();
    try {
      await contract.unauthorizeCaller(userOne, { from: userTwo });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be owner or authorized caller");
    }
  });

  // contract call authorization management
  it("As owner of the contract should authorize a caller", async () => {
    let contract = await InsuranceCoverageAmendmentProposal.deployed();
    await contract.authorizeCaller(userOne, { from: owner });
    await contract.authorizeCaller(authorizedCaller, { from: owner });
  });

  it("As caller not owner of the contract should fail to authorize a caller", async () => {
    let contract = await InsuranceCoverageAmendmentProposal.deployed();
    try {
      await contract.authorizeCaller(userOne, { from: userTwo });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be owner or authorized caller");
    }
  });

  it("As  owner of the contract should unauthorize a caller ", async () => {
    let contract = await InsuranceCoverageAmendmentProposal.deployed();
    await contract.unauthorizeCaller(userOne, { from: owner });
  });

  it("As caller not owner of the contract should fail to unauthorize a caller ", async () => {
    let contract = await InsuranceCoverageAmendmentProposal.deployed();
    try {
      await contract.unauthorizeCaller(userOne, { from: userTwo });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be owner or authorized caller");
    }
  });

  // contract related functions

  // register a new membership amendment proposal

  it("As an authorized caller register a new membership amendment proposal", async () => {
    let contract = await InsuranceCoverageAmendmentProposal.deployed();
    await contract.registerInsuranceCoverageAmendmentProposal(userOne, 1, 1, {
      from: authorizedCaller,
    });
  });

  it("As an unauthorized caller should fail to register a new membership amendment proposal", async () => {
    let contract = await InsuranceCoverageAmendmentProposal.deployed();
    try {
      await contract.registerInsuranceCoverageAmendmentProposal(userOne, 1, 1, {
        from: unauthorizedCaller,
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be authorized");
    }
  });

  // vote an exitsing memebership fee amendment proposal
  it("As an authorized caller vote an exitsing memebership fee amendment proposal", async () => {
    let contract = await InsuranceCoverageAmendmentProposal.deployed();
    await contract.voteInsuranceCoverageAmendmentProposal(1, userOne, true, 1, {
      from: authorizedCaller,
    });
  });

  it("As an unauthorized caller should fail to vote an exitsing memebership fee amendment proposal", async () => {
    let contract = await InsuranceCoverageAmendmentProposal.deployed();
    try {
      await contract.voteInsuranceCoverageAmendmentProposal(
        1,
        userOne,
        true,
        1,
        {
          from: unauthorizedCaller,
        }
      );
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be authorized");
    }
  });

  // activate an existing membership fee amendement proposal

  it("As an authorized caller activate an existing membership fee amendement proposal", async () => {
    let contract = await InsuranceCoverageAmendmentProposal.deployed();
    await contract.activateInsuranceCoverageAmendmentProposal(1, {
      from: authorizedCaller,
    });
  });

  it("As an unauthorized caller should fail to activate an existing membership fee amendement proposal", async () => {
    let contract = await InsuranceCoverageAmendmentProposal.deployed();
    try {
      await contract.activateInsuranceCoverageAmendmentProposal(1, {
        from: unauthorizedCaller,
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "caller must be authorized");
    }
  });

  // check wether a voter as already voted for a specific proposal

  it("As an authorized caller check wether a voter as already voted for a specific proposal", async () => {
    let contract = await InsuranceCoverageAmendmentProposal.deployed();
    const bool = await contract.hasVotedInsuranceCoverageAmendmentProposal(
      userOne,
      1,
      {
        from: authorizedCaller,
      }
    );
    assert.equal(bool, true);
  });

  it("As an unauthorized caller should fail to check wether a voter as already voted for a specific proposal", async () => {
    let contract = await InsuranceCoverageAmendmentProposal.deployed();
    try {
      await contract.hasVotedInsuranceCoverageAmendmentProposal(userOne, 1, {
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

  // fetch the current vote count for a insurance coverage amendment proposal

  it("As an authorized caller fetch the current vote count for a insurance coverage amendment proposal", async () => {
    let contract = await InsuranceCoverageAmendmentProposal.deployed();
    const count = await contract.getVoteCountInsuranceCoverageAmendmentProposal(
      1,
      true,
      { from: authorizedCaller }
    );

    assert.equal(new BigNumber(count).isEqualTo(new BigNumber(2)), true);
  });

  it("As an unauthorized caller should fail to fetch the current vote count for a insurance coverage amendment proposal", async () => {
    let contract = await InsuranceCoverageAmendmentProposal.deployed();
    try {
      await contract.getVoteCountInsuranceCoverageAmendmentProposal(1, true, {
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

  // fetch the insurance coverage
  it("As an authorized caller fetch the insurance coverage", async () => {
    let contract = await InsuranceCoverageAmendmentProposal.deployed();
    const coverage = await contract.getCurrentInsuranceCoverage({
      from: authorizedCaller,
    });
    assert.equal(new BigNumber(coverage).isEqualTo(new BigNumber(1)), true);
  });

  it("As an unauthorized caller should fail to fetch the insurance coverage", async () => {
    let contract = await InsuranceCoverageAmendmentProposal.deployed();
    try {
      await contract.getCurrentInsuranceCoverage({ from: unauthorizedCaller });
      assert.fail();
    } catch (error) {
      assert.equal(
        error.message,
        "Returned error: VM Exception while processing transaction: revert caller must be authorized"
      );
    }
  });

  // fetch the insurance coverage proposal current proposal ID

  it("As an authorized caller fetch the insurance coverage proposal current proposal ID", async () => {
    let contract = await InsuranceCoverageAmendmentProposal.deployed();
    const id = await contract.getInsuranceCoverageAmendmentCurrentProposalID({
      from: authorizedCaller,
    });
    assert.equal(new BigNumber(id).isEqualTo(new BigNumber(1)), true);
  });

  it("As an unauthorized caller should fail to fetch the insurance coverage proposal current proposal ID", async () => {
    let contract = await InsuranceCoverageAmendmentProposal.deployed();
    try {
      await contract.getInsuranceCoverageAmendmentCurrentProposalID({
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

  // check weather a proposal has reached consensus
  it("As an authorized caller check weather a proposal has reached consensus", async () => {
    let contract = await InsuranceCoverageAmendmentProposal.deployed();
    const bool =
      await contract.hasInsuranceCoverageAmendmentProposalReachedConsensus(
        1,
        true,
        2,
        { from: authorizedCaller }
      );
    assert.equal(bool, true);
  });

  it("As an unauthorized caller should fail to check weather a proposal has reached consensus", async () => {
    let contract = await InsuranceCoverageAmendmentProposal.deployed();
    try {
      await contract.hasInsuranceCoverageAmendmentProposalReachedConsensus(
        1,
        true,
        2,
        { from: unauthorizedCaller }
      );
      assert.fail();
    } catch (error) {
      assert.equal(
        error.message,
        "Returned error: VM Exception while processing transaction: revert caller must be authorized"
      );
    }
  });
});
