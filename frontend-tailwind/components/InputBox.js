import { useSession } from "next-auth/react"
import Image from "next/image"
import {
    EmojiHappyIcon,
} from "@heroicons/react/outline"
import {
    CameraIcon, VideoCameraIcon
} from "@heroicons/react/solid"
import { useRef, useState } from "react"
import { db, storage } from "../firebase"
import { collection, addDoc, serverTimestamp, setDoc } from "firebase/firestore";
import {
    ref,
    uploadString,
    getDownloadURL
} from "firebase/storage";


function InputBox() {

    // const { data: session } = useSession()
    const inputRef = useRef(null)
    const filepickerRef = useRef(null)
    const [imageToPost, setImageToPost] = useState(null)

    const sendPost = async (e) => {
        e.preventDefault()
        if (!inputRef.current.value) return

        try {
            const docRef = await addDoc(collection(db, "posts"), {
                username: "pules",
                caption: inputRef.current.value,
                profileImg: "/postthreadicon.png",
                timestamp: serverTimestamp(),
            })
            console.log("Document written with ID: ", docRef.id);
            if (imageToPost) {
                const storageRef = ref(storage, `posts/${docRef.id}`)
                uploadString(storageRef, imageToPost, "data_url").then(() => {
                    getDownloadURL(storageRef)
                        .then((url) => {
                            setDoc(docRef, {
                                image: url
                            }, { merge: true })
                        })
                })
                removeImage()
            }
        } catch (e) {
            console.error("Error adding document: ", e);
        }

        inputRef.current.value = ''
    }

    const addImageToPost = (e) => {
        const reader = new FileReader();
        if (e.target.files[0]) {
            reader.readAsDataURL(e.target.files[0]);
        }

        reader.onload = (readerEvent) => {
            setImageToPost(readerEvent.target.result);
        };
    }

    const removeImage = () => {
        setImageToPost(null)
    }

    return (
        <div className="bg-primary p-2 rounded-2xl shadow-md text-gray-500 font-medium mt-6">
            <div className="flex space-x-4 items-center p-4">
                <Image
                    className="rounded-full cursor-pointer"
                    src="/postthreadicon.png"
                    width={40} height={40}
                    layout="fixed"
                />
                <form className="flex flex-1">
                    <input
                        className="rounded-full h-12 bg-base-100 flex-grow px-5 focus:outline-none"
                        type="text"
                        ref={inputRef}
                        placeholder={`What's on your mind?`} />
                    <button hidden type="submit" onClick={sendPost}>Submit</button>
                </form>
                {imageToPost && (
                    <div onClick={removeImage} className="flex flex-col filter
                    hover:brightness-110 transition duration-150 transform hover:scale-105
                    cursor-pointer">
                        <img className="h-10 object-contain"
                            src={imageToPost} />
                        <p className="text-xs text-red-500 text-center">Remove</p>
                    </div>
                )}
            </div>

            <div className="flex justify-evenly p-3 border-t">
                <div onClick={() => filepickerRef.current.click()} className="flex items-center space-x-1 hover:bg-primary-focus flex-grow justify-center p-2 rounded-xl cursor-pointer " >
                    <CameraIcon className="h-7 text-success" />
                    <p className="text-xs sm:text-sm xl:text-base text-base-100">Photo/Video</p>
                    <input ref={filepickerRef} onChange={addImageToPost} type="file" hidden />
                </div>
                <div className="flex items-center space-x-1 hover:bg-primary-focus flex-grow justify-center p-2 rounded-xl cursor-pointer ">
                    <EmojiHappyIcon className="h-7 text-warning" />
                    <p className="text-xs sm:text-sm xl:text-base text-base-100">Feeling/Activity</p>
                </div>
            </div >
        </div >
    )
}

export default InputBox