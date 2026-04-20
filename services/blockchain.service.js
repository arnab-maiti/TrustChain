try {
  require("dotenv").config();
} catch (error) {
  // The environment may already be injected by the runtime.
}

const { ethers } = require("ethers");
const trustChainArtifact = require("../artifacts/contracts/TrustChain.sol/TrustChain.json");

const rpcUrl = process.env.ALCHEMY_RPC_URL;
const privateKey = process.env.PRIVATE_KEY;
const contractAddress = process.env.CONTRACT_ADDRESS;

const provider = rpcUrl
  ? new ethers.JsonRpcProvider(rpcUrl, "sepolia", { staticNetwork: true })
  : null;
const wallet =
  provider && privateKey ? new ethers.Wallet(privateKey, provider) : null;

const getContract = () => {
  if (!contractAddress) {
    throw new Error("Missing CONTRACT_ADDRESS in environment");
  }

  if (!wallet) {
    throw new Error(
      "Blockchain wallet not configured. Check ALCHEMY_RPC_URL and PRIVATE_KEY.",
    );
  }

  return new ethers.Contract(contractAddress, trustChainArtifact.abi, wallet);
};

const testConnection = async () => {
  if (!provider) {
    console.warn("Blockchain provider not configured: missing ALCHEMY_RPC_URL");
    return;
  }

  try {
    const blockNumber = await provider.getBlockNumber();
    console.log(`Connected to blockchain. Current block number: ${blockNumber}`);
  } catch (error) {
    console.error("Error connecting to blockchain:", error);
  }
};

const createDeliveryHash = (productId, courierId, status, timestamp) => {
  const data = `${productId}-${courierId}-${status}-${timestamp}`;
  return ethers.keccak256(ethers.toUtf8Bytes(data));
};

const storeOnchain = async (hash) => {
  const contract = getContract();
  const tx = await contract.storeHash(hash);
  await tx.wait();
  return tx.hash;
};

module.exports = {
  provider,
  wallet,
  testConnection,
  createDeliveryHash,
  storeOnchain,
};
