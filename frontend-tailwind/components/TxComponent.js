import React from 'react'
import TronSVG from './Buttons/TronSVG';
import MetamaskSVG from './Buttons/MetamaskSVG';
import { useToasts } from 'react-toast-notifications';
import { useAppContext } from '../context/AppContext';
import { ethers } from "ethers";

export default function TxComponent({ type }) {

    const { addToast } = useToasts();
    const context = useAppContext()
    const id = context.id;

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

    const signTronMessage = async () => {
        if (typeof window !== "undefined") {
            try {
                if (!(window.tronWeb && window.tronWeb.defaultAddress.base58)) {
                    addToast(`Install TronLink to proceed`, {
                        appearance: 'failure',
                        autoDismiss: true,
                    })
                    throw new Error("No TronLink wallet found. Please install it.");
                }
                const tronWeb = window.tronWeb
                const tronLink = window.tronLink
                const requestAccountsResponse = await tronLink.request({ method: 'tron_requestAccounts' })
                console.log(requestAccountsResponse)
                const str = "verify";
                var HexStr = tronWeb.toHex(str);
                var signedStr = await tronWeb.trx.sign(HexStr);
                console.log(signedStr)
                await linkWallet(tronWeb.defaultAddress.base58, signedStr)
                addToast(`Account ${tronWeb.defaultAddress.base58} successfully linked`, {
                    appearance: 'success',
                    autoDismiss: true,
                })
            } catch (e) {
                console.log(e);
            }
        }
    }

    const signMetamaskMessage = async () => {
        try {
            if (!window.ethereum) {
                addToast(`Install Metamask to proceed`, {
                    appearance: 'failure',
                    autoDismiss: true,
                })
                throw new Error("No Metamask wallet found. Please install it.");
            }

            await window.ethereum.send("eth_requestAccounts");
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const signature = await signer.signMessage("verify");
            const address = await signer.getAddress();

            console.log({ address, signature });

            await linkWallet(address, signature)
            addToast(`Account ${address} successfully linked`, {
                appearance: 'success',
                autoDismiss: true,
            })

        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className='container'>
            {type === "tron" ?
                <button className="w-full bg-primary py-1 px-2 rounded text-inherit font-semibold text-sm gap-3 flex" onClick={signTronMessage}>
                    <TronSVG />
                </button> :
                <button className="mt-4 w-full bg-primary py-1 px-2 rounded text-inherit font-semibold text-sm gap-3 flex" onClick={signMetamaskMessage}>
                    <MetamaskSVG />
                </button>
            }
        </div>
    )
}
