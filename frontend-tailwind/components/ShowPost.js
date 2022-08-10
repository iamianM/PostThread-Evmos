import {
    EmojiHappyIcon,
} from "@heroicons/react/outline"
import { ShareIcon, ThumbUpIcon, ThumbDownIcon } from "@heroicons/react/outline";
import { useSession } from "next-auth/react"
import { ThumbUpIcon as ThumbUpIconFilled } from "@heroicons/react/solid"
import { ThumbDownIcon as ThumbDownIconFilled } from "@heroicons/react/solid"
import { useEffect, useState } from "react"
import TimeAgo from 'react-timeago'
import toast from "react-hot-toast"
import { ADD_COMMENT, ADD_VOTE } from '../graphql/mutations'
import { GET_COMMENTS_BY_POST_ID, GET_VOTES_BY_POST_ID } from '../graphql/queries'
import { useMutation, useQuery } from '@apollo/client';
import Link from "next/link";
import { NewtonsCradle } from '@uiball/loaders'
import Post from "./Post";
import Suggestions from "./Suggestions";

function ShowPost({ post }) {

    const { data: session } = useSession()
    const [vote, setVote] = useState()
    const [user_id, setUser_id] = useState(0)

    console.log(post)

    useEffect(() => {
        if (session?.user) {
            setUser_id(localStorage?.getItem("user_id"))
        }
    }, [session])

    const { data: voteData, loading: voteLoading } = useQuery(GET_VOTES_BY_POST_ID, {
        variables: { id: post?.id }
    })

    const [addVote] = useMutation(ADD_VOTE, {
        refetchQueries: [
            GET_VOTES_BY_POST_ID,
            'getVoteUsingPost_id'
        ]
    })

    useEffect(() => {
        const votes = voteData?.getVoteUsingPost_id
        const vote = votes?.find(vote => vote.user_id === user_id)?.up
        setVote(vote)

    }, [voteData])

    const upVote = async (isUpVote) => {
        if (vote && isUpVote) return
        if (vote === false && !isUpVote) return

        await addVote({
            variables: {
                post_id: post.id,
                up: isUpVote,
                user_id: user_id
            }
        })
    }

    if (!post) {
        return (
            <div className="flex w-full h-screen items-center justify-center p-10 text-3-xl">
                <NewtonsCradle
                    size={50}
                    speed={1.4}
                    color="black"
                />
            </div>
        )
    }

    return (
        <Link href={`/post/${post.id}`}>
            <div className={`bg-base-100 my-7 max-w-3xl border rounded-t-2xl rounded-b-2xl shadow-sm cursor-pointer`}>
                <Link href={`/post/${post.id}`}>
                    <div>
                        <div className="flex items-center p-5">
                            <img src={post?.user?.profile_pic} className="rounded-full h-12 object-contain border p-1 mr-3" />
                            <div className="flex-col flex-1">
                                <p className="font-bold">{post?.user?.username}</p>
                                <Link href={`/category/${post?.category?.name}`}>
                                    <p className="text-sm cursor-pointer hover:text-info hover:underline">p/{post?.category?.name}</p>
                                </Link>
                            </div>
                            <TimeAgo className="text-sm" date={post?.created_at} />
                        </div>

                        <div className="p-7">
                            <h1 className="text-base-content text-lg font-semibold">{post?.title}</h1>
                            <p className="m-5">{post?.body}</p>
                        </div>

                        <img src={post?.url} className="object-cover w-full" />
                    </div>
                </Link>

                {
                    session &&
                    <>
                        <div className="flex justify-between items-center bg-base-100 text-base-content border-t rounded-b-2xl p-4">
                            <div className={`flex space-x-1 items-center hover:bg-base-200 flex-grow justify-center p-2 rounded-xl cursor-pointer hover:text-success ${vote && 'text-success'}`}
                                onClick={() => upVote(true)}>
                                {vote ? <ThumbUpIconFilled className="h-4" /> : <ThumbUpIcon className="h-4" />}
                                <p className="text-xs sm:text-base">Upvote</p>
                            </div>
                            <div className={`flex space-x-1 items-center hover:bg-base-200 flex-grow justify-center p-2 rounded-xl cursor-pointer hover:text-error ${vote === false && 'text-error'}`}
                                onClick={() => upVote(false)} >
                                {vote === false ? <ThumbDownIconFilled className="h-4" /> : <ThumbDownIcon className="h-4" />}
                                <p className="text-xs sm:text-base">Downvote</p>
                            </div>
                            <div className="flex space-x-1 items-center hover:bg-base-200 flex-grow justify-center p-2 rounded-xl cursor-pointer ">
                                <ShareIcon className="h-4" />
                                <p className="text-xs sm:text-base">Share</p>
                            </div>
                        </div>
                    </>
                }
            </div >
        </Link>
    )
}

export default ShowPost