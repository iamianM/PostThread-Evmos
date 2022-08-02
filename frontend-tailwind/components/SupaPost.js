import {
    BookmarkIcon,
    ChatIcon,
    DotsHorizontalIcon,
    EmojiHappyIcon,
    HeartIcon,
    PaperAirplaneIcon
} from "@heroicons/react/outline"
import { ChatAltIcon, ShareIcon, ThumbUpIcon, ThumbDownIcon } from "@heroicons/react/outline";

import { useSession } from "next-auth/react"
import { HeartIcon as HeartIconFilled } from "@heroicons/react/solid"
import { useEffect, useState } from "react"
import { db } from "../firebase"
import { addDoc, collection, onSnapshot, serverTimestamp, orderBy, query, setDoc, doc, deleteDoc } from "firebase/firestore"
import Moment from "react-moment"

function SupaPost({ id, username, userImg, img, caption }) {

    // const { data: session } = useSession()
    const [comment, setComment] = useState("")
    const [comments, setComments] = useState([])
    const [likes, setLikes] = useState([])
    const [hasLiked, setHasLiked] = useState(false)

    useEffect(() => {
        return onSnapshot(query(collection(db, "posts", id, "comments"), orderBy("timestamp", "desc")),
            (snapshot) => {
                setComments(snapshot.docs)
            }
        )
    }, [db, id])

    useEffect(() => {
        return onSnapshot((collection(db, "posts", id, "likes")),
            (snapshot) => {
                setLikes(snapshot.docs)
            }
        )
    }, [db, id])

    // useEffect(() => {
    //     setHasLiked(
    //         likes.findIndex((like) => like.id === session?.user?.uid) !== -1)
    // }, [likes])

    // const likePost = async () => {
    //     if (hasLiked) {
    //         await deleteDoc(doc(db, "posts", id, "likes", session.user.uid))
    //     } else {
    //         await setDoc(doc(db, "posts", id, "likes", session.user.uid), {
    //             username: session.user.username,
    //         })
    //     }
    // }

    const sendComment = async (e) => {
        e.preventDefault()
        const commentToSend = comment
        setComment("")

        await addDoc(collection(db, "posts", id, "comments"), {
            comment: commentToSend,
            username: "session.user.username",
            userImage: "/postthreadicon.png",
            timestamp: serverTimestamp()
        })
    }

    return (
        <div className="bg-base-100 my-7 border rounded-t-2xl rounded-b-2xl shadow-sm">
            <div className="flex items-center p-5">
                <img src={userImg} className="rounded-full h-12 object-contain border p-1 mr-3" />
                <p className="flex-1 font-bold">{username}</p>
                <DotsHorizontalIcon className="h-5" />
            </div>

            <img src={img} className="object-cover w-full" />

            <div>
                <p className="p-5 truncate">
                    {likes.length > 0 && (
                        <p className="font-bold mb-1">{likes.length} likes</p>
                    )}
                    <span className="font-bold mr-1">{username} </span>
                    {caption}
                </p>
            </div>

            {comments.length > 0 && (
                <div className="ml-10 h-20 overflow-y-scroll scrollbar-thumb-black scrollbar-thin">
                    {comments.map(comment => (
                        <div key={comment.id} className="flex items-center space-x-2 mb-3">
                            <img className="h-7 rounded-full" src={comment.data().userImage} />
                            <p className="text-sm flex-1">
                                <span className="font-bold">{comment.data().username}</span>
                                {" "}{comment.data().comment}
                            </p>
                            <Moment fromNow className="pr-5 text-xs">{comment.data().timestamp?.toDate()}</Moment>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-between items-center bg-base-100 text-base-content border-t">
                <div className="flex space-x-1 items-center hover:bg-base-200 flex-grow justify-center p-2 rounded-xl cursor-pointer">
                    <ThumbUpIcon className="h-4" />
                    <p className="text-xs sm:text-base">Upvote</p>
                </div>
                <div className="flex space-x-1 items-center hover:bg-base-200 flex-grow justify-center p-2 rounded-xl cursor-pointer">
                    <ThumbDownIcon className="h-4" />
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
                <button type="submit" disabled={!comment.trim()} onClick={sendComment} className="font-semibold text-primary hover:text-primary-focus cursor-pointer">Post</button>
            </form>

        </div>
    )
}

export default SupaPost