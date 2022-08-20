import Link from "next/link"
import { useMutation, useQuery } from '@apollo/client'
import { GET_FOLLOWINGS_BY_USER_ID } from "../graphql/queries"
import { ADD_FOLLOW, REMOVE_FOLLOW } from "../graphql/mutations"
import { useState, useEffect } from 'react'

function SuggestionRow({ profile }) {

    const user_id = localStorage.getItem("user_id")
    const [isFollowing, setIsFollowing] = useState(null)
    const username = profile?.username || profile?.reddit_username

    const { data: followData } = useQuery(GET_FOLLOWINGS_BY_USER_ID, {
        variables: { id: user_id }
    })

    const [addFollow] = useMutation(ADD_FOLLOW, {
        variables: {
            follower_id: user_id,
            following_id: profile.id
        },
        refetchQueries: [
            GET_FOLLOWINGS_BY_USER_ID,
            'getFollowingsByUser_id'
        ]
    })

    const [removeFollow] = useMutation(REMOVE_FOLLOW, {
        variables: {
            follower_id: user_id,
            following_id: profile.id
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
                following_id: profile.id,
            }
        })
    }

    const unfollow = async () => {
        await removeFollow({
            variables: {
                follower_id: user_id,
                following_id: profile.id,
            }
        })
    }

    useEffect(() => {
        if (followData?.getFollowingsByUser_id) {
            const following = followData.getFollowingsByUser_id.find(follow => follow.following.id === profile.id)
            if (following) {
                setIsFollowing(true)
            } else {
                setIsFollowing(false)
            }
        }
    }, [followData])

    return (
        <div key={profile.id} className="flex items-center justify-between mt-3">
            <img className="w-10 h-10 rounded-full border p-[2px]" src={profile.profile_pic} />
            <Link href={`/user/${username}`}>
                <div className="flex-1 ml-4 hover:text-info hover:underline cursor-pointer">
                    <h2 className="font-semibold text-sm">{username}</h2>
                </div>
            </Link>
            {isFollowing ? (
                <button
                    className="text-primary text-xs font-semibold hover:text-primary-focus"
                    onClick={() => unfollow()}>
                    Unfollow
                </button>
            ) : (
                <button
                    className="text-primary text-xs font-semibold hover:text-primary-focus"
                    onClick={() => follow()}>
                    Follow
                </button>
            )}
        </div>
    )
}

export default SuggestionRow