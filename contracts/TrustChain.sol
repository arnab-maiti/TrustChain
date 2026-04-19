// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;
contract TrustChain {
    event deliveryHash(bytes32 indexed hash,address indexed sender,uint256 timestamp);
    mapping (string => bytes32) public storedHashes;
    function storeHash(bytes32 _hash) external {
        require(!storedHashes[_hash], "Hash already stored");
        storedHashes[_hash] = true;
        emit deliveryHash(_hash, msg.sender, block.timestamp);
    }
    function verifyHash(bytes32 _hash) external view returns (bool) {
        return storedHashes[_hash];
        
    }
}