import { useEffect, useState } from 'react'
import TimeAgo from 'react-timeago'
import { UserAddIcon, UserRemoveIcon } from '@heroicons/react/outline'
import { useMutation, useQuery } from '@apollo/client'
import { GET_FOLLOWINGS_BY_USER_ID, GET_USER_PROFILE_CARD_BY_USER_ID } from '../graphql/queries'
import { ADD_FOLLOW, REMOVE_FOLLOW, UPDATE_USER_TOKENS_CLAIMED } from '../graphql/mutations'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

function ProfileCard({ id }) {

    const [isFollowing, setIsFollowing] = useState(null)
    const [user_id, setUser_id] = useState(0)
    const { data: session } = useSession()

    useEffect(() => {
        if (session?.user) {
            setUser_id(localStorage?.getItem("user_id"))
        }
    }, [session])

    const { data: userData } = useQuery(GET_USER_PROFILE_CARD_BY_USER_ID, {
        variables: { id: id }
    })

    console.log(userData)


    const { data: followData } = useQuery(GET_FOLLOWINGS_BY_USER_ID, {
        variables: { id: user_id }
    })

    const dailyReward = userData?.getUsers?.tokens_to_claim || 0
    const percentageToNextLevel = (userData?.getUsers?.exp * 100) / userData?.getUsers?.exp_to_next_level

    const [claimReward] = useMutation(UPDATE_USER_TOKENS_CLAIMED, {
        variables: {
            id: user_id,
            claimed: true
        },
        refetchQueries: [
            GET_USER_PROFILE_CARD_BY_USER_ID,
            'getUserProfileCardByUser_id'
        ]
    })

    const claim = async () => {
        if (userData?.getUsers?.wallet_address_personal) {
            try { await claimReward() } catch (e) {
                toast.error("Something went wrong. Please try again later.")
                return
            }
            toast.success("Tokens successfully requested!")
        } else {
            toast.error("You need to have a personal wallet address to claim tokens! Go to the Settings tab")
        }
    }

    const [addFollow] = useMutation(ADD_FOLLOW, {
        variables: {
            follower_id: user_id,
            following_id: id
        },
        refetchQueries: [
            GET_FOLLOWINGS_BY_USER_ID,
            'getFollowingsByUser_id'
        ]
    })

    const [removeFollow] = useMutation(REMOVE_FOLLOW, {
        variables: {
            follower_id: user_id,
            following_id: id
        },
        refetchQueries: [
            GET_FOLLOWINGS_BY_USER_ID,
            'getFollowingsByUser_id'
        ]
    })

    const follow = async () => {
        await addFollow({
            variables: {
                follower_id: user_id,
                following_id: id,
            }
        })
    }

    const unfollow = async () => {
        await removeFollow({
            variables: {
                follower_id: user_id,
                following_id: id,
            }
        })
    }

    useEffect(() => {
        if (followData?.getFollowingsByUser_id) {
            console.log(followData?.getFollowingsByUser_id)
            const following = followData.getFollowingsByUser_id.find(follow => follow.following.id === id)
            if (following) {
                setIsFollowing(true)
            } else {
                setIsFollowing(false)
            }
        }
    }, [followData])

    console.log(id)


    return (
        <div className="bg-base-100 my-7 max-w-3xl border rounded-t-2xl rounded-b-2xl shadow-sm cursor-pointer">
            <div>
                <div className="flex flex-col items-center p-5">
                    <img src={userData?.getUsers?.profile_pic} className="object-cover w-full rounded-md" />
                    <div className="flex-col flex-1 mt-3">
                        <h4 className="font-bold text-3xl">{userData?.getUsers?.username ?? userData?.getUsers?.reddit_username}</h4>
                    </div>
                    {userData?.getUsers?.created_at && <p className='text-sm'>Profile created: {' '}
                        <TimeAgo className="text-sm" date={userData?.getUsers?.created_at} />
                    </p>}
                    {user_id === id ? (
                        <>
                            <button className="w-auto bg-primary p-2 rounded-xl text-inherit font-semibold text-sm gap-3 mt-5 flex-1 disabled:bg-primary-focus"
                                onClick={claim} disabled={userData?.getUsers?.tokens_claimed}>
                                {userData?.getUsers?.tokens_claimed ? "Daily reward already claimed" : `Get daily reward💰 ${dailyReward}`}
                            </button >
                        </>
                    ) : (
                        <>
                            {isFollowing ? <button
                                className='flex text-lg items-center rounded-xl shadow-md p-2 px-5 bg-primary hover:bg-primary-focus border-primary text-inherit mt-5 space-x-2'
                                onClick={() => unfollow()}>
                                <p>Unfollow</p>
                                <UserRemoveIcon className='h-5 font-semibold' />
                            </button> :
                                <button
                                    className='flex text-lg items-center font-semibold rounded-xl shadow-md p-2 px-5 bg-primary hover:bg-primary-focus border-primary text-inherit mt-5 space-x-2'
                                    onClick={() => follow()}>
                                    <p>Follow</p>
                                    <UserAddIcon className='h-5 font-semibold' />
                                </button>}
                        </>
                    )
                    }
                    <h1 className='font-semibold mt-4 '>Level: {userData?.getUsers?.level}</h1>
                    <progress className="progress w-56 progress-primary" value={percentageToNextLevel} max="100"></progress>
                    <h1 className='font-semibold mt-4 '>Social score: {userData?.getUsers?.social_score}</h1>
                </div>
            </div>
        </div>
    )
}

export default ProfileCard