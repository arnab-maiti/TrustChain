// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
contract TrustChain {
    event DeliveryStored(bytes32 indexed deliveryHash, address indexed sender, uint256 timestamp);
    mapping(bytes32 => bool) public storedHashes;
    function storeHash(bytes32 _hash) external {
        require(!storedHashes[_hash], "Hash already stored");
        storedHashes[_hash] = true;
        emit DeliveryStored(_hash, msg.sender, block.timestamp);
    }
    function verifyHash(bytes32 _hash) external view returns (bool) {
        return storedHashes[_hash];
    }
}