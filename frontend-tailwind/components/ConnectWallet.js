import { useEthers, shortenAddress } from '@usedapp/core'
import MetamaskIcon from "./icons/MetamaskIcon"

function ConnectWallet() {

    const { account, activateBrowserWallet, deactivate } = useEthers()

    return (
        <div>
            {!account ? (
                <button
                    onClick={() => activateBrowserWallet()}
                    className='flex space-x-2 items-center border rounded-2xl bg-primary w-auto p-2 cursor-pointer'>
                    <MetamaskIcon width={20} height={20} />
                    <p className='font-semibold'>
                        Connect
                    </p>
                </button>
            ) : (
                <button
                    onClick={() => deactivate()}
                    className='flex space-x-2 items-center border rounded-2xl bg-primary w-auto p-1 cursor-pointer'>
                    <MetamaskIcon width={20} height={20} />
                    <p className='font-semibold text-sm'>
                        {`Disconnect ${shortenAddress(account)}`}
                    </p>
                </button>
            )}
        </div>
    )
}

export default ConnectWallet