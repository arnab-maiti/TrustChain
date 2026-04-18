const {ethers} = require('ethers');

const rpcUrl = process.env.ALCHEMY_RPC_URL;
const privateKey = process.env.PRIVATE_KEY;
const contractAddress = process.env.CONTRACT_ADDRESS;

const provider = rpcUrl
    ? new ethers.JsonRpcProvider(rpcUrl, "sepolia", { staticNetwork: true })
    : null;
const wallet = provider && privateKey ? new ethers.Wallet(privateKey, provider) : null;

const testConnection = async () => {
    if (!provider) {
        console.warn('Blockchain provider not configured: missing ALCHEMY_RPC_URL');
        return;
    }

    try{
        const blockNumber = await provider.getBlockNumber();
        console.log(`Connected to blockchain. Current block number: ${blockNumber}`);
    }
    catch(error){
        console.error('Error connecting to blockchain:', error);
    }
};
const contract = new ethers.Contract(contractAddress, abi, wallet);
module.exports = {
    provider,
    wallet,
    testConnection,
    contract
};
