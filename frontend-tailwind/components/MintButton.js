import { utils, ethers } from 'ethers'
import { Contract } from '@ethersproject/contracts'
import { ABI, CONSTANTS } from '../constants/Constants'
import { useEthers, useContractFunction } from '@usedapp/core'
import toast from 'react-hot-toast'
import { SparklesIcon } from '@heroicons/react/outline'

function MintButton({ message }) {

    const { account } = useEthers()
    const contractInterface = new utils.Interface(ABI)
    const contractAddress = CONSTANTS.contractAddress
    const contract = new Contract(contractAddress, contractInterface)

    const { state, send } = useContractFunction(contract, 'addMessagesByUser', {
        transactionName: 'Mint message',
        gasLimitBufferPercentage: 10,
    })

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

    // const testMessage = ['{"ipfs_hash": "QmdS9A99VS7Q7b1VTW8BTfAhdk79U7Y3s2ExfHJQwMkYtF"}']

    const mintMessage = async () => {

        if (!account) {
            toast.error('Please connect your wallet')
            return
        }

        try {
            await signMessage({
                message: "Post minting"
            });
            toast.success("Post minted successfully")
        } catch (e) {
            toast.error("Something went wrong. Please try again later")
        }

        // await send(3, testMessage)
        // if (state.status === "None") toast.error("Something went wrong. Please try again later")
        // else toast.success("Message minted successfully")
    }

    return (
        <button
            onClick={() => mintMessage()}
            className='flex justify-center items-center border rounded-lg bg-success w-auto p-1 hover:bg-success-focus cursor-pointer'>
            <p className='font-semibold text-xs text-base-100'>
                Mint
            </p>
            <SparklesIcon className="h-4 text-base-100 text-xs" />
        </button>
    )
}

export default MintButton