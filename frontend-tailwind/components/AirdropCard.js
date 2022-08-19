//https://cointelegraph.com/news/nifty-news-fluf-world-and-snoop-dogg-fundraise-adidas-and-prada-nfts-wax-gifts-10m-nfts
import { useQuery } from '@apollo/client'
import { GET_USER_SOCIAL_INFO, GET_AIRDROP_INFO } from '../graphql/queries'
import client from '../apollo-client'
import { UPDATE_USER_REDDIT, UPDATE_USER_AIRDROP_STATUS } from '../graphql/mutations'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function AirdropCard() {

    const [reddit, setReddit] = useState('')

    const { data } = useQuery(GET_USER_SOCIAL_INFO, {
        variables: {
            id: localStorage.getItem('user_id')
        }
    })

    const { data: airdropInfo } = useQuery(GET_AIRDROP_INFO)
    console.log("Info " + airdropInfo)
    let title, body
    airdropInfo?.getVariables?.map(variable => {
        if (variable.variable_name === 'airdrop_title') { title = variable.variable_value }
        else if (variable.variable_name === 'airdrop_body') { body = variable.variable_value }
    })

    title = title?.replace("AIRDROP_VALUE", data?.getUsers?.reddit_airdrop_value)
    body = body?.replace("USER_WALLET", data?.getUsers?.wallet_address_personal)

    const updateRedditUser = async (event) => {
        // Stop the form from submitting and refreshing the page.
        event.preventDefault()
        await client.mutate({
            mutation: UPDATE_USER_REDDIT,
            variables: {
                id: localStorage.getItem('user_id'),
                value: reddit
            },
            refetchQueries: [{ query: GET_USER_SOCIAL_INFO, variables: { id: localStorage.getItem('user_id') } }]
        })
    }

    const claimAirdrop = async (event) => {
        // Stop the form from submitting and refreshing the page.
        event.preventDefault()
        try {
            await client.mutate({
                mutation: UPDATE_USER_AIRDROP_STATUS,
                variables: {
                    id: localStorage.getItem('user_id'),
                    value: "requested"
                },
                refetchQueries: [{ query: GET_USER_SOCIAL_INFO, variables: { id: localStorage.getItem('user_id') } }]
            })
            toast.success("Airdrop successfully requested!")
        } catch (error) {
            toast.error("Something went wrong, please try again!")
        }
    }



    return (
        <div className="h-auto p-10 flex items-center justify-center">
            <div className="w-auto max-w-2xl bg-base-100 border rounded-2xl text-center hover:shadow-lg align-center">
                <img src="/airdrop.png" className="rounded-t-lg" />
                <div className="flex justify-center">
                    <span className="flex-shrink-0 w-12 h-12 bg-primary-400 -mt-6 rounded-full">
                        <img alt="profil" src="/postthreadicon.png"
                            className="mx-auto object-cover rounded-full" />
                    </span>
                </div>

                {(!data?.getUsers?.wallet_address_personal) ?
                    <div className="flex justify-center items-center space-x-2 m-4">
                        <p className='font-bold text-xl'> To request the airdrop you need to set your wallet address in the Settings tab</p>
                    </div> :
                    (!(data?.getUsers?.reddit_username)) ?
                        <>
                            <p className="font-bold pt-3 pb-2"> PostThread Airdrop </p>
                            <p className="px-10 py-2 mb-5 text-gray-500">The PostThread airdrop rewards users with a number of tokens determined by their existing reddit karma. Insert your reddit username to check how much tokens you can receive for free!</p>

                            <div className="m-4 flex justify-center">
                                <input onChange={(e) => setReddit(e.target.value)} className="rounded-l-lg p-4 border-t mr-0 border-b border-l text-gray-800 border-gray-200 bg-neutral-100" placeholder="username" />
                                <button onClick={(e) => updateRedditUser(e)} className="px-8 rounded-r-lg bg-primary text-inherit font-bold p-4 border-primary border-t border-b border-r">Check</button>
                            </div>
                        </> :
                        <>
                            <div className='flex justify-center items-center space-x-2'>
                                <p className="font-semibold pt-3 pb-2"> Reddit username provided: </p>
                                <p className='text-xl uppercase text-error'>{`${data?.getUsers?.reddit_username}`} </p>
                            </div>
                            <p className="font-bold pt-3 pb-2"> {`Airdrop value: ${data?.getUsers?.reddit_airdrop_value}🧵`}  </p>
                            <p className="font-semibold pt-3 pb-2"> Post the following message on reddit to receive the thread tokens:  </p>
                            <p className="px-10 py-2 mb-5 text-gray-500 font-semibold">{title}</p>
                            <p className="px-10 py-2 mb-5 text-gray-500">{body}</p>
                            <button onClick={(e) => claimAirdrop(e)}
                                className="bg-primary px-4 py-2 mb-4 rounded-xl font-semibold text-inherit hover:bg-secondary-focus focus:ring focus:ring-purple-500 focus:ring-opacity-25 outline-none"
                            >
                                Claim!
                            </button>
                        </>}

                {data?.getUsers?.reddit_airdrop_claimed === "requested" &&
                    <div className="flex justify-center items-center space-x-2 m-4">
                        <p className='font-bold text-xl'> All set! You should receive the airdrop tokens within the next 24 hours.</p>
                    </div>}
            </div>
        </div >
    )
}
