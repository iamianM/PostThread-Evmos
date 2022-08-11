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

function Post({ post }) {

    const { data: session } = useSession()
    const { data, loading } = useQuery(GET_COMMENTS_BY_POST_ID, {
        variables: { id: post?.id }
    })

    const { data: voteData, loading: voteLoading } = useQuery(GET_VOTES_BY_POST_ID, {
        variables: { id: post?.id }
    })

    const [comment, setComment] = useState("")
    const comments = data?.getCommentUsingPost_id || []
    const [vote, setVote] = useState()
    const [user_id, setUser_id] = useState(0)

    useEffect(() => {
        if (session?.user) {
            setUser_id(localStorage?.getItem("user_id"))
        }
    }, [session])

    const [addComment] = useMutation(ADD_COMMENT, {
        refetchQueries: [
            GET_COMMENTS_BY_POST_ID,
            'getCommentUsingPost_id'
        ]
    })

    const [addVote] = useMutation(ADD_VOTE, {
        refetchQueries: [
            GET_VOTES_BY_POST_ID,
            'getVoteUsingPost_id'
        ]
    })

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


    const sendComment = async (e) => {
        toast.loading("Posting your comment...", {
            id: "comment-toast",
        })
        e.preventDefault()
        const commentToSend = comment
        setComment("")

        try {
            await addComment({
                variables: {
                    body: commentToSend,
                    post_id: post.id,
                    user_id: user_id
                }
            })

            toast.success("Comment posted!", {
                id: "comment-toast",
            })
        } catch (error) {
            toast.error("Error posting comment", {
                id: "comment-toast",
            })
        }
    }

    useEffect(() => {
        const votes = voteData?.getVoteUsingPost_id
        const vote = votes?.find(vote => vote.user_id === user_id)?.up
        setVote(vote)

    }, [voteData])

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
    } else {
        return (
            <div className="bg-base-100 my-7 max-w-3xl border rounded-t-2xl rounded-b-2xl shadow-sm cursor-pointer">
                <Link href={`/post/${post.id}`}>
                    <div>
                        <div className="flex items-center p-5">
                            <img src={post?.user?.profile_pic} className="rounded-full h-12 object-contain border p-1 mr-3" />
                            <div className="flex-col flex-1">
                                <Link href={`/user/${post?.user?.username}`}>
                                    <p className="font-bold cursor-pointer hover:text-info hover:underline">{post?.user?.username}</p>
                                </Link>
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

                        <div>
                            <div className="p-5 truncate">
                                {/* {likes.length > 0 && (
                        <p className="font-bold mb-1">{likes.length} likes</p>
                    )} */}
                                {
                                    comments?.length > 0 && (
                                        <p className="font-semibold text-sm mb-1">{comments?.length} comments</p>
                                    )
                                }
                            </div>
                        </div>

                        {comments.length > 0 && (
                            <div className="ml-6 h-20 overflow-y-scroll scrollbar-hide scrollbar-thumb-black scrollbar-thin">
                                {comments.map(comment => (
                                    <div key={comment.id} className="flex items-center space-x-2 mb-3">
                                        <img className="h-7 rounded-full" src={comment?.user?.profile_pic} />
                                        <p className="text-sm flex-1">
                                            <span className="font-bold">{comment?.user?.username}</span>
                                            {" "}{comment.body}
                                        </p>
                                        <TimeAgo className="text-sm px-4" date={comment?.created_at} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Link>

                {
                    session &&
                    <>
                        <div className="flex justify-between items-center bg-base-100 text-base-content border-t">
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

                        <form className="flex items-center p-4 border-t">
                            <EmojiHappyIcon className="h-7" />
                            <input
                                type="text"
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="border-none bg-base-100 flex-1 focus:ring-0 outline-none"
                            />
                            <button type="submit" onClick={sendComment} disabled={!comment.trim()} className="font-semibold text-primary hover:text-primary-focus cursor-pointer">Comment</button>
                        </form>
                    </>
                }
            </div >
        )
    }
}

export default Post