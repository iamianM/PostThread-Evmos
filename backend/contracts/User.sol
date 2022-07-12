// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract User {
    Counters.Counter private _msaId;

    mapping(address => uint) public addressToMsaId;

    function isValidUser(uint256 _number, bytes memory sig, address userAddress) public view returns(bool){
        bytes32 message = keccak256(abi.encodePacked(_number));
        return (recoverSigner(message, sig) == userAddress);
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

    function createMsaId(address userAddress) public returns (uint) {
        require(!addressToMsaId[userAddress].valid, "User already has msaId");
        uint delegatorMsaId = _msaId.increment();
        return delegatorMsaId;
    }

    function createSponsoredAccountWithDelegation(address delegatorAddress, address providerAddress, bytes memory sig) public returns (uint) {
        uint delegatorMsaId = createMsaId(delegatorAddress);
        uint providerMsaId = delegataddressToMsaId[providerAddress];
        require(providerMsaId.valid, "Provider does not have msaId");
        require(isValidUser(providerMsaId, sig, userAddress), "Invalid signature");
        return delegatorMsaId;
    }
}