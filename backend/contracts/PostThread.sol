// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/utils/Counters.sol";

contract PostThread {
    using Counters for Counters.Counter;
    Counters.Counter private msaIds;
    Counters.Counter public schemaIds;

    mapping(address => uint) public addressToMsaId;

    event MsaRegistered(address sender, uint msaId);
    event Signatures(address givenSig, address expectedSig, bytes32 message);

    struct Message {
        uint onBehalfOf;
        uint schemaId;
        string payload;
        uint blockNumber;
        uint timestamp;
        uint providerMsaId;
    }

    mapping(uint => Message[]) public schemaIdToMessages;
    mapping(uint => string) public idToSchema;

    // SIGNATURE
    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }
    
    function isValidUser(uint256 _number, bytes memory sig, address userAddress) public returns(bool){
        bytes32 message = prefixed(keccak256(abi.encodePacked(_number)));
        address recoveredAddress = recoverSigner(message, sig);
        emit Signatures(userAddress, recoveredAddress, message);
        return (recoveredAddress == userAddress);
    }

    function recoverSigner(bytes32 message, bytes memory sig) public pure returns (address) {
        uint8 v;
        bytes32 r;
        bytes32 s;
        (v, r, s) = splitSignature(sig);
        return ecrecover(message, v, r, s);
    }

    function splitSignature(bytes memory sig) public pure returns (uint8, bytes32, bytes32) {
        require(sig.length == 65);
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }

    // MSA 
    function createMsaId(address userAddress) public returns (uint) {
        require(addressToMsaId[userAddress] == 0, "User already has msaId");
        msaIds.increment();
        addressToMsaId[userAddress] = msaIds.current();
        emit MsaRegistered(userAddress, addressToMsaId[userAddress]);
        return addressToMsaId[userAddress];
    }

    function getMsaId(address userAddress) public view returns (uint) {
        require(addressToMsaId[userAddress] != 0, "User does not have msaId");
        return addressToMsaId[userAddress];
    }

    function createSponsoredAccountWithDelegation(address delegatorAddress, address providerAddress, bytes memory sig) public returns (uint) {
        uint delegatorMsaId = createMsaId(delegatorAddress);
        uint providerMsaId = addressToMsaId[providerAddress];
        require(providerMsaId != 0, "Provider does not have msaId");
        
        require(isValidUser(providerMsaId, sig, delegatorAddress), "Invalid signature");
        return delegatorMsaId;
    }

    // Schema
    function registerSchema(string memory schema) public returns (uint) {
        schemaIds.increment();
        uint schemaId = schemaIds.current();
        idToSchema[schemaId] = schema;
        return schemaId;
    }

    function getSchema(uint schemaId) public view returns (string memory) {
        return idToSchema[schemaId];
    }

    function getSchemaCount() public view returns (uint) {
        return schemaIds.current();
    }

    // Message
    function addMessage(uint providerMsaId, uint onBehalfOf, uint schemaId, string memory payload) public returns (bool) {
        require(bytes(idToSchema[schemaId]).length != 0, "Schema does not exist");
        require(providerMsaId < msaIds.current() + 1, "Provider MsaId does not exist");
        require(onBehalfOf < msaIds.current() + 1, "Delegator MsaId does not exist");

        schemaIdToMessages[schemaId].push(Message(
            onBehalfOf, schemaId, payload, block.number, block.timestamp, providerMsaId
        ));
        return true;
    }

    function getNumberOfMessages(uint schemaId) public view returns (uint) {
        return schemaIdToMessages[schemaId].length;
    }

    function getMessages(uint schemaId, uint offset) public view returns (Message[100] memory) {
        require(bytes(idToSchema[schemaId]).length != 0, "Schema does not exist");
        Message[100] memory messages;
        uint l = schemaIdToMessages[schemaId].length;
        uint upperBound;
        if (100 * offset > l) {
            return messages;
        } else if (100 * (offset + 1) > l) {
            upperBound = l - 100 * offset;
        } else {
            upperBound = 100;
        }

        for (uint i = 0; i < upperBound; i++) {
            messages[i] = schemaIdToMessages[schemaId][100 * offset + i];
        }
        return messages;
    }

}