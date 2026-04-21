const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("TrustChain", function () {
  async function deployTrustChainFixture() {
    const TrustChain = await ethers.getContractFactory("TrustChain");
    const trustChain = await TrustChain.deploy();
    await trustChain.waitForDeployment();

    return { trustChain };
  }

  it("stores a new delivery hash", async function () {
    const { trustChain } = await deployTrustChainFixture();
    const hash = ethers.keccak256(ethers.toUtf8Bytes("shipment-001"));

    const tx = await trustChain.storeHash(hash);
    const receipt = await tx.wait();
    const deliveryStoredLog = receipt.logs.find(
      (log) => log.fragment && log.fragment.name === "DeliveryStored",
    );

    expect(deliveryStoredLog).to.exist;
    expect(deliveryStoredLog.args.deliveryHash).to.equal(hash);
    expect(deliveryStoredLog.args.sender).to.equal(await trustChain.runner.getAddress());

    expect(await trustChain.verifyHash(hash)).to.equal(true);
    expect(await trustChain.storedHashes(hash)).to.equal(true);
  });

  it("rejects duplicate hashes", async function () {
    const { trustChain } = await deployTrustChainFixture();
    const hash = ethers.keccak256(ethers.toUtf8Bytes("shipment-001"));

    await trustChain.storeHash(hash);

    let errorMessage = "";
    try {
      await trustChain.storeHash(hash);
    } catch (error) {
      errorMessage = error.message;
    }

    expect(errorMessage).to.include("Hash already stored");
  });
});
