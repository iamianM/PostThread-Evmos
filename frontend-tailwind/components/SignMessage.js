import { ethers } from "ethers";
import toast from "react-hot-toast"
import MetamaskIcon from "./icons/MetamaskIcon";
import { UPDATE_USER_WALLET, UPDATE_SIGNATURE } from "../graphql/mutations";
import { GET_USER_SOCIAL_INFO, GET_USER_PROFILE_CARD_BY_USER_ID } from "../graphql/queries";
import client from "../apollo-client";
import { useState } from "react";
import { PencilIcon } from "@heroicons/react/solid"

const verifyMessage = async ({ message, address, signature }) => {
    try {
        const signerAddr = await ethers.utils.verifyMessage(message, signature);
        if (signerAddr !== address) {
            return false;
        }

        return true;
    } catch (err) {
        toast.error(err);
        return false;
    }
};

const signMessage = async ({ message }) => {
    try {
        console.log({ message });
        if (!window.ethereum) {
            toast.error("No crypto wallet found. Please install it.");
            return
        }

        await window.ethereum.send("eth_requestAccounts");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const signature = await signer.signMessage(message);
        const address = await signer.getAddress();

        return {
            message,
            signature,
            address
        };
    } catch (err) {
        toast.error(err.message);
    }
};

export default function SignMessage({ wallet }) {

    const [disabled, setDisabled] = useState(wallet)

    const handleSign = async (e) => {
        e.preventDefault();
        const sig = await signMessage({
            message: "Postthread verification"
        });
        if (sig) {
            const verified = await verifyMessage({
                message: "Postthread verification",
                address: sig.address,
                signature: sig.signature
            });

            if (verified) {
                try {
                    await client.mutate({
                        mutation: UPDATE_USER_WALLET,
                        variables: {
                            id: localStorage.getItem("user_id"),
                            value: sig.address
                        },
                        refetchQueries: [{ query: GET_USER_SOCIAL_INFO, variables: { id: localStorage.getItem("user_id") } },
                        { query: GET_USER_PROFILE_CARD_BY_USER_ID, variables: { id: localStorage.getItem("user_id") } }]
                    })
                    console.log(sig.signature)
                    await client.mutate({
                        mutation: UPDATE_SIGNATURE,
                        variables: {
                            id: localStorage.getItem("user_id"),
                            value: sig.signature
                        },
                    })
                    toast.success("Wallet address verified!")
                } catch (err) {
                    toast.error(err.message)
                }
            }
        } else {
            toast.error("Error signing message")
        }
    };

    return (
        <div className="flex space-x-4 items-center p-4">
            <MetamaskIcon width={40} height={40} />
            <button
                onClick={(e) => handleSign(e)}
                disabled={disabled}
                className="rounded-xl h-12 bg-primary hover:bg-primary-focus border border-primary focus:ring-primary focus:border-primary flex-grow px-5 font-semibold text-lg focus:outline-none disabled:bg-base-200"
            >
                {disabled ? wallet : "Verify wallet"}
            </button>
            {
                disabled &&
                <button type='submit' onClick={(e) => {
                    e.preventDefault()
                    setDisabled(false)
                }}>
                    <PencilIcon className="h-6 cursor-pointer text-neutral" />
                </button>
            }
        </div>
    );
}
