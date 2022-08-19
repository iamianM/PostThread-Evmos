// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PostThread is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private msaIds;
    Counters.Counter public schemaIds;

    mapping(address => uint) public addressToMsaId;
    mapping(address => uint[]) public addressToDelegatedMsaIds;

    event MsaRegistered(address sender, uint msaId);
    event Signatures(address givenSig, address expectedSig, bytes32 message);

    struct Message {
        uint onBehalfOf;
        uint schemaId;
        string payload;
        uint timestamp;
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

    function delegateMsaId(address delegatorAddress, address providerAddress) internal {
        require(delegatorAddress != providerAddress, "User cannot delegate to self");
        uint providerMsaId = addressToMsaId[providerAddress];
        uint delegatorMsaId = addressToMsaId[delegatorAddress];
        require(providerMsaId != 0, "Provider does not have msaId");
        require(delegatorMsaId != 0, "Delegator does not have msaId");

        uint[] memory delegatedMsaIds = addressToDelegatedMsaIds[providerAddress];
        for (uint i = 0; i < delegatedMsaIds.length; i++) {
            require(delegatedMsaIds[i] != delegatorMsaId, "msaId already delegated to provider");
        }

        addressToDelegatedMsaIds[providerAddress].push(delegatorMsaId);
    }

    function getDelegatedMsaId(address providerAddress) public view returns (uint[] memory) {
        return addressToDelegatedMsaIds[providerAddress];
    }

    function createSponsoredAccountsWithDelegation(address[] memory delegatorAddresses, bytes[] memory sigs) public returns (uint[] memory) {
        address providerAddress = msg.sender;
        uint providerMsaId = addressToMsaId[providerAddress];
        require(providerMsaId != 0, "Provider does not have msaId");
        
        uint[] memory delegatorMsaIds = new uint[](delegatorAddresses.length);
        for (uint i = 0; i < delegatorAddresses.length; i++) {
            delegatorMsaIds[i] = createMsaId(delegatorAddresses[i]);
            require(isValidUser(providerMsaId, sigs[i], delegatorAddresses[i]), "Invalid signature");
            delegateMsaId(delegatorAddresses[i], providerAddress);
        }

        return delegatorMsaIds;
    }

    function addProviderToMsa(address providerAddress, bytes memory sig) public returns (bool) {
        uint providerMsaId = addressToMsaId[providerAddress];
        require(providerMsaId != 0, "Provider does not have msaId");
        
        uint delegatorMsaId = addressToMsaId[msg.sender];
        require(isValidUser(providerMsaId, sig, providerAddress), "Invalid signature");
        delegateMsaId(msg.sender, providerAddress);

        return true;
    }

    function revokeMsaDelegationByDelegator(address providerAddress) public returns (bool) {
        uint providerMsaId = addressToMsaId[providerAddress];
        require(providerMsaId != 0, "Provider does not have msaId");
        uint delegatorMsaId = addressToMsaId[msg.sender];
        require(delegatorMsaId != 0, "Delegator does not have msaId");

        uint[] memory delegatedMsaIds = addressToDelegatedMsaIds[providerAddress];
        for (uint i = 0; i < delegatedMsaIds.length; i++) {
            if(delegatedMsaIds[i] == delegatorMsaId) {
                addressToDelegatedMsaIds[providerAddress][i] = addressToDelegatedMsaIds[providerAddress][delegatedMsaIds.length - 1];
                addressToDelegatedMsaIds[providerAddress].pop();
                return true;
            }
        }
        require(false, "Delegator is not delegated to provider");
        return false;
    }

    function revokeMsaDelegationByProvider(address delegatorAddress) public returns (bool) {
        address providerAddress = msg.sender;
        uint providerMsaId = addressToMsaId[providerAddress];
        require(providerMsaId != 0, "Provider does not have msaId");
        uint delegatorMsaId = addressToMsaId[delegatorAddress];
        require(delegatorMsaId != 0, "Delegator does not have msaId");

        uint[] memory delegatedMsaIds = addressToDelegatedMsaIds[providerAddress];
        for (uint i = 0; i < delegatedMsaIds.length; i++) {
            if(delegatedMsaIds[i] == delegatorMsaId) {
                addressToDelegatedMsaIds[providerAddress][i] = addressToDelegatedMsaIds[providerAddress][delegatedMsaIds.length - 1];
                addressToDelegatedMsaIds[providerAddress].pop();
                return true;
            }
        }
        require(false, "Delegator is not delegated to provider");
        return false;
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
    function addMessagesByProvider(uint[] memory onBehalfOfs, uint schemaId, string[] memory payloads) public returns (bool) {
        require(bytes(idToSchema[schemaId]).length != 0, "Schema does not exist");
        uint providerMsaId = addressToMsaId[msg.sender];
        require(providerMsaId != 0, "Provider does not have msaId");
        uint[] memory delegatedMsaIds = addressToDelegatedMsaIds[msg.sender];
        require(delegatedMsaIds.length != 0, "Provider is not delegated any msaIds");

        uint lastBehalfOf = 0;
        for (uint i = 0; i < payloads.length; i++) {
            bool isDelegated = false;
            if (onBehalfOfs[i] == lastBehalfOf) {
                isDelegated = true;
            } 
            uint j = 0;
            while (j < delegatedMsaIds.length && !isDelegated) {
                if(onBehalfOfs[j] == delegatedMsaIds[j]) {
                    isDelegated = true;
                }
                j++;
            }
            require(isDelegated, "Delegator is not delegated to provider");

            schemaIdToMessages[schemaId].push(Message(
                onBehalfOfs[i], schemaId, payloads[i], block.timestamp
            ));
        }
        return true;
    }

    function addMessagesByUser(uint schemaId, string[] memory payloads) public returns (bool) {
        require(bytes(idToSchema[schemaId]).length != 0, "Schema does not exist");
        uint msaId = addressToMsaId[msg.sender];
        require(msaId != 0, "User does not have msaId");

        for (uint i = 0; i < payloads.length; i++) {
            schemaIdToMessages[schemaId].push(Message(
                msaId, schemaId, payloads[i], block.timestamp
            ));
        }
        return true;
    }
    
    function addMessagesByOwner(uint[] memory onBehalfOfs, uint schemaId, string[] memory payloads) public onlyOwner returns (bool) {
        require(bytes(idToSchema[schemaId]).length != 0, "Schema does not exist");

        for (uint i = 0; i < payloads.length; i++) {
            schemaIdToMessages[schemaId].push(Message(
                onBehalfOfs[i], schemaId, payloads[i], block.timestamp
            ));
        }
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