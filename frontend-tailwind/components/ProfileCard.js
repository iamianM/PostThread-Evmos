import { useEffect, useState } from 'react'
import TimeAgo from 'react-timeago'
import { UserAddIcon, UserRemoveIcon } from '@heroicons/react/outline'
import { useMutation, useQuery } from '@apollo/client'
import { GET_FOLLOWINGS_BY_USER_ID } from '../graphql/queries'
import { ADD_FOLLOW, REMOVE_FOLLOW } from '../graphql/mutations'
import { useSession } from 'next-auth/react'

function ProfileCard({ username, profile_pic, created_at, id }) {

    const [isFollowing, setIsFollowing] = useState(null)
    const [user_id, setUser_id] = useState(0)
    const { data: session } = useSession()

    useEffect(() => {
        if (session?.user) {
            setUser_id(localStorage?.getItem("user_id"))
        }
    }, [session])

    const { data: followData } = useQuery(GET_FOLLOWINGS_BY_USER_ID, {
        variables: { id: user_id }
    })

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
            const following = followData.getFollowingsByUser_id.find(follow => follow.following.id === id)
            if (following) {
                setIsFollowing(true)
            } else {
                setIsFollowing(false)
            }
        }
    }, [followData])


    return (
        <div className="bg-base-100 my-7 max-w-3xl border rounded-t-2xl rounded-b-2xl shadow-sm cursor-pointer">
            <div>
                <div className="flex flex-col items-center p-5">
                    <img src={profile_pic} className="object-cover w-full rounded-md" />
                    <div className="flex-col flex-1 mt-3">
                        <h4 className="font-bold text-3xl">{username}</h4>
                    </div>
                    <p className='text-sm'>Profile created: {' '}
                        <TimeAgo className="text-sm" date={created_at} />
                    </p>
                    {user_id !== id && isFollowing ? (
                        <button
                            className='flex text-lg items-center rounded-xl shadow-md p-2 px-5 bg-primary hover:bg-primary-focus border-primary text-inherit mt-5 space-x-2'
                            onClick={() => unfollow()}>
                            <p>Unfollow</p>
                            <UserRemoveIcon className='h-5 font-semibold' />
                        </button>) : (
                        <button
                            className='flex text-lg items-center font-semibold rounded-xl shadow-md p-2 px-5 bg-primary hover:bg-primary-focus border-primary text-inherit mt-5 space-x-2'
                            onClick={() => follow()}>
                            <p>Follow</p>
                            <UserAddIcon className='h-5 font-semibold' />
                        </button>
                    )
                    }
                </div>
            </div>
        </div>
    )
}

export default ProfileCard