const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

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

    await expect(trustChain.storeHash(hash))
      .to.emit(trustChain, "DeliveryHashStored")
      .withArgs(hash, anyValue, anyValue);

    expect(await trustChain.verifyHash(hash)).to.equal(true);
    expect(await trustChain.storedHashes(hash)).to.equal(true);
  });

  it("rejects duplicate hashes", async function () {
    const { trustChain } = await deployTrustChainFixture();
    const hash = ethers.keccak256(ethers.toUtf8Bytes("shipment-001"));

    await trustChain.storeHash(hash);

    await expect(trustChain.storeHash(hash)).to.be.revertedWith(
      "Hash already stored",
    );
  });
});
