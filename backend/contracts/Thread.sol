// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Thread is ERC20, ERC20Burnable, Ownable {
    constructor() ERC20("Thread", "bTHRD") {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function multiMint(address[] memory tos, uint256[] memory amounts) public returns (bool) {
        require(tos.length == amounts.length, "tos and amounts must have the same length");
        for (uint i = 0; i < tos.length; i++) {
            mint(tos[i], amounts[i]);
        }
        return true;
    }

    function multiTransfer(address[] memory tos, uint256[] memory amounts) public returns (bool) {
        require(tos.length == amounts.length, "tos and amounts must have the same length");
        for (uint i = 0; i < tos.length; i++) {
            transfer(tos[i], amounts[i]);
        }
        return true;
    }
}