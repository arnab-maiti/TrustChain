// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;
contract TrustChain {
    mapping (string => bytes32) public deliveryHash;
    function storeDelivery(string memory productId, bytes32 hash) public {
        deliveryHash[productId]= hash;
    }
    function getDelivery(string memory productId) public view returns () {
        return deliveryHash[productId];
    }
}