import {
    EmojiHappyIcon,
} from "@heroicons/react/outline"
import { ShareIcon, ThumbUpIcon, ThumbDownIcon, ClockIcon } from "@heroicons/react/outline";
import { useSession } from "next-auth/react"
import { ThumbUpIcon as ThumbUpIconFilled, ArrowCircleUpIcon, ArrowCircleDownIcon } from "@heroicons/react/solid"
import { ShieldCheckIcon } from "@heroicons/react/solid"
import { ThumbDownIcon as ThumbDownIconFilled } from "@heroicons/react/solid"
import { useEffect, useState } from "react"
import TimeAgo from 'react-timeago'
import toast from "react-hot-toast"
import { ADD_COMMENT, ADD_VOTE } from '../graphql/mutations'
import { GET_COMMENTS_BY_POST_ID, GET_VOTES_BY_POST_ID } from '../graphql/queries'
import { useMutation, useQuery } from '@apollo/client';
import Link from "next/link";
import { JellyTriangle } from '@uiball/loaders'
import { v4 as uuidv4 } from 'uuid';
import { create } from 'ipfs-http-client';
import MintButton from "./MintButton";

function Post({ post, showAddComment, showComments, showFull, showMint }) {

    const { data: session } = useSession()
    const [imageError, setImageError] = useState(false);
    const [isLink, setIsLink] = useState(false);

    const projectId = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_ID
    const projectSecret = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_SECRET
    const projectIdAndSecret = `${projectId}:${projectSecret}`

    const ipfsClient = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
            authorization: `Basic ${Buffer.from(projectIdAndSecret).toString(
                'base64'
            )}`,
        },
    })

    const onImageNotFound = (url) => {
        if (url.startsWith("https://www.reddit.com/r/") || url.startsWith("https://v.redd.it/")) {
            setIsLink(true)
            return
        }
        else setImageError(true);
    }

    const { data } = useQuery(GET_COMMENTS_BY_POST_ID, {
        variables: { id: post?.id }
    })

    const { data: voteData } = useQuery(GET_VOTES_BY_POST_ID, {
        variables: { id: post?.id }
    })

    const [comment, setComment] = useState("")
    const comments = data?.getCommentsUsingPost_id || []
    const [vote, setVote] = useState()
    const [user_id, setUser_id] = useState(0)
    const username = post?.users?.username || post?.users?.reddit_username

    useEffect(() => {
        if (session?.user) {
            setUser_id(localStorage?.getItem("user_id"))
        }
    }, [session])

    const [addComment] = useMutation(ADD_COMMENT, {
        refetchQueries: [
            GET_COMMENTS_BY_POST_ID,
            'getCommentsUsingPost_id'
        ]
    })

    const [addVote] = useMutation(ADD_VOTE, {
        refetchQueries: [
            GET_VOTES_BY_POST_ID,
            'getVotesUsingPost_id'
        ]
    })

    const upVote = async (isUpVote) => {
        if (vote && isUpVote) return
        if (vote === false && !isUpVote) return

        await addVote({
            variables: {
                post_id: post.id,
                up: isUpVote,
                user_id: localStorage?.getItem("user_id")
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

        const commentToIpfs = JSON.stringify({
            body: commentToSend,
            post_id: post.id,
            user_id: localStorage?.getItem("user_id")
        })

        const added = await ipfsClient.add(commentToIpfs)
        console.log(added)
        const commentUrl = `https://postthread.infura-ipfs.io/ipfs/${added.path}`

        try {
            await addComment({
                variables: {
                    body: commentToSend,
                    post_id: post.id,
                    user_id: user_id,
                    ipfs_hash: commentUrl
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
        const votes = voteData?.getVotesUsingPost_id
        const vote = votes?.find(vote => vote.user_id === user_id)?.up
        setVote(vote)
    }, [voteData])

    if (!post) {
        return (
            <div className="flex w-full h-screen items-center justify-center p-10 text-3-xl">
                <JellyTriangle
                    size={50}
                    speed={1.4}
                    color="black"
                />
            </div>
        )
    } else {
        return (
            <div className="bg-base-100 my-7 max-w-3xl border rounded-t-2xl rounded-b-2xl shadow-sm cursor-pointer">

                <div>
                    <div className="flex items-center p-5">
                        <img src={post?.users?.profile_pic} className="rounded-full h-12 object-contain border p-1 mr-3" />
                        <div className="flex-col flex-1">
                            <Link href={`/user/${username}`}>
                                <p className="font-bold cursor-pointer hover:text-info hover:underline">{username}</p>
                            </Link>
                            <Link href={`/category/${post?.categories?.name}`}>
                                <p className="text-sm cursor-pointer hover:text-info hover:underline">p/{post?.categories?.name}</p>
                            </Link>
                        </div>
                        <div className="flex space-x-2">
                            <TimeAgo className="text-sm" date={post?.created_at} />
                            {post.transaction_hash ?
                                <ShieldCheckIcon className="h-5 text-success" /> :
                                <ClockIcon className="h-5 text-base-300" />
                            }
                        </div>
                    </div>
                    <div className={`flex ${showMint ? "justify-between" : "justify-end"} m-4`}>
                        {showMint && <MintButton />}
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center ">
                                <ArrowCircleUpIcon className="h-5 text-success" />
                                <p>{post?.reddit_upvotes ?? 0} </p>
                            </div>
                            <div className="flex items-center">
                                <ArrowCircleDownIcon className="h-5 text-error" />
                                <p>{post?.reddit_downvotes ?? 0}</p>
                            </div>
                        </div>
                    </div>
                    <Link href={`/post/${post.id}`}>
                        <a>
                            <div className="p-7">
                                <h1 className="text-base-content text-lg font-semibold">{post?.title}</h1>
                                <p className={`m-5 ${!showFull && "truncate"} ${showFull && "text-ellipsis"}`}>{post?.body}</p>
                            </div>
                            <div className="flex justify-center">
                                {
                                    post?.url && !isLink && (
                                        <img src={imageError ? 'https://reactnative-examples.com/wp-content/uploads/2022/02/error-image.png' : post?.url} onError={() => onImageNotFound(post?.url)} className={`p-4 object-cover ${showFull ? "w-full" : "w-2/3"}`} />
                                    )
                                }
                            </div>
                        </a>
                    </Link>
                    <div>
                        <div className="p-5 truncate">
                            {
                                comments?.length > 0 && (
                                    <p className="font-semibold text-sm mb-1">{comments?.length} comments</p>
                                )
                            }
                        </div>
                    </div>

                    {showComments && comments?.length > 0 && (
                        <div className="ml-6 h-auto max-h-40 overflow-y-scroll scrollbar-hide scrollbar-thumb-black scrollbar-thin">
                            {comments.map(comment => (
                                <div key={uuidv4()} className="flex items-center space-x-2 mb-3">
                                    <img className="h-7 rounded-full" src={comment?.users?.profile_pic} />
                                    <p className="text-sm flex-1">
                                        <Link href={`/user/${comment?.users?.username ?? comment?.users?.reddit_username}`}>
                                            <span className="font-bold hover:text-info hover:underline cursor-pointer">{comment?.users?.username ?? comment?.users?.reddit_username}</span>
                                        </Link>
                                        {" "}{comment.body}
                                    </p>
                                    <div className="flex items-center space-x-2">
                                        <TimeAgo className="text-sm" date={comment?.created_at} />
                                        {comment.transaction_hash ?
                                            <ShieldCheckIcon className="h-3 text-success px-2" /> :
                                            <ClockIcon className="h-3 text-base-300 px-2" />
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {
                    session &&
                    <>
                        <div className="flex justify-between items-center bg-base-100 rounded-b-2xl text-base-content border-t">
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

                        {showAddComment && <form className="flex items-center p-4 border-t">
                            <EmojiHappyIcon className="h-7" />
                            <input
                                type="text"
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="border-none bg-base-100 flex-1 focus:ring-0 outline-none"
                            />
                            <button type="submit" onClick={sendComment} disabled={!comment.trim()} className="font-semibold text-primary hover:text-primary-focus cursor-pointer">Comment</button>
                        </form>}
                    </>
                }
            </div >
        )
    }
}

export default Post