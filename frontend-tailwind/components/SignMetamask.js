import { useState, useRef } from "react";
import { ethers } from "ethers";
import React from 'react'
import MetamaskSVG from "./Buttons/MetamaskSVG";


async function linkWallet(address, signedMessage) {
    const response = await fetch(`/api/user/link?` + new URLSearchParams({
        account_type: "wallet",
        account_value: address,
        user_msa_id: id,
        signed_message: signedMessage,
        wait_for_inclusion: true
    }), {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    const data = await response.json()
    return data
}

const signMessage = async () => {
    try {
        if (!window.ethereum)
            throw new Error("No crypto wallet found. Please install it.");

        await window.ethereum.send("eth_requestAccounts");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const signature = await signer.signMessage("verify");
        const address = await signer.getAddress();

        console.log({ address, signature });

        return {
            message,
            signature,
            address
        };
    } catch (err) {
        console.log(err);
    }
};


export default function SignMetamask() {

    return (
        <div className='container'>
            <button className="mt-4 w-full bg-primary py-1 px-2 rounded text-inherit font-semibold text-sm gap-3 flex" onClick={signMessage}>
                <MetamaskSVG />
            </button>
        </div>
    )
}
