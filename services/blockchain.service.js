const {ethers} = require('ethers');

const rpcUrl = process.env.ALCHEMY_RPC_URL;
const privateKey = process.env.PRIVATE_KEY;
const contractAddress = process.env.CONTRACT_ADDRESS;
const abi =[
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "productId",
				"type": "string"
			},
			{
				"internalType": "bytes32",
				"name": "hash",
				"type": "bytes32"
			}
		],
		"name": "storeDelivery",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "deliveryHash",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "productId",
				"type": "string"
			}
		],
		"name": "getDelivery",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
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
