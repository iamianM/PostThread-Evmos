import { useEffect } from "react"
import { useState } from "react"
import { ShieldCheckIcon } from "@heroicons/react/solid"
import { ClockIcon } from "@heroicons/react/outline"
import {
    EmojiHappyIcon,
} from "@heroicons/react/outline"
import { useQuery, useMutation } from '@apollo/client'
import { GET_COMMENTS_BY_POST_ID } from '../graphql/queries'
import TimeAgo from 'react-timeago'
import toast from "react-hot-toast"
import { ADD_COMMENT } from '../graphql/mutations'
import { useSession } from "next-auth/react";
import { create } from 'ipfs-http-client';

function Comments({ id, showAddComment }) {

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

    const { data: session } = useSession()
    const [user_id, setUser_id] = useState(0)

    useEffect(() => {
        if (session?.user) {
            setUser_id(localStorage?.getItem("user_id"))
        }
    }, [session])

    const { data, refetch } = useQuery(GET_COMMENTS_BY_POST_ID, {
        variables: { id: id }
    })

    const [comment, setComment] = useState("")
    const comments = (data?.getCommentsUsingPost_id || [])

    const [addComment] = useMutation(ADD_COMMENT, {
        refetchQueries: [
            GET_COMMENTS_BY_POST_ID,
            'getCommentUsingPost_id'
        ]
    })

    const sendComment = async (e) => {
        toast.loading("Posting your comment...", {
            id: "comment-toast",
        })
        e.preventDefault()
        const commentToSend = comment
        setComment("")

        const commentToIpfs = JSON.stringify({
            body: commentToSend,
            post_id: id,
            user_id: user_id
        })

        const added = await ipfsClient.add(commentToIpfs)
        console.log(added)
        const commentUrl = `https://postthread.infura-ipfs.io/ipfs/${added.path}`

        try {
            await addComment({
                variables: {
                    body: commentToSend,
                    post_id: id,
                    user_id: user_id,
                    ipfs_hash: commentUrl
                }
            })

            toast.success("Comment posted!", {
                id: "comment-toast",
            })

            refetch()
        } catch (error) {
            toast.error("Error posting comment", {
                id: "comment-toast",
            })
        }
    }

    return (
        <div className="bg-base-100 mt-7 p-5 border rounded-t-2xl rounded-b-2xl shadow-sm scrollbar-hide overflow-y-scroll">
            <div className="flex justify-between text-sm mb-5">
                <h3 className="text-sm font-bold text-gray-400">Comments</h3>
            </div>
            {comments.length > 0 && (
                <div className="ml-6 h-fit max-h-96 overflow-y-scroll scrollbar-hide scrollbar-thumb-black scrollbar-thin">
                    {comments.map(comment => (
                        <div key={comment.id} className="flex items-center space-x-2 mb-3">
                            <img className="h-7 rounded-full" src={comment?.users?.profile_pic} />
                            <p className="text-sm flex-1">
                                <span className="font-bold">{comment?.users?.username ?? comment?.users?.reddit_username}</span>
                                {" "}{comment.body}
                            </p>
                            <div className="flex items-center space-x-2">
                                <TimeAgo className="text-sm px-4" date={comment?.created_at} />
                                {comment.transaction_hash ?
                                    <ShieldCheckIcon className="h-3 text-success px-2" /> :
                                    <ClockIcon className="h-3 text-base-300 px-2" />
                                }
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {showAddComment &&
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
                </form>}
        </div>
    )
}

export default Comments