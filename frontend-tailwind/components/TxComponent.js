import React from 'react'
import TronSVG from './Buttons/TronSVG';
import { useToasts } from 'react-toast-notifications';
import { useAppContext } from '../context/AppContext';

export default function TxComponent() {

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

    const connect = async () => {
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

    return (
        <div className='container'>
            <p className='mt-4'>Verify your wallet:</p>
            <button className="w-full bg-primary py-1 px-2 rounded text-inherit font-semibold text-sm gap-3 flex" onClick={connect}>
                <TronSVG />
            </button>
        </div>
    )
}
