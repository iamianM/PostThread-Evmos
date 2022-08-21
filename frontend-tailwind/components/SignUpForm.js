import { CameraIcon } from '@heroicons/react/outline'
import { create } from 'ipfs-http-client';
import { useRef, useState } from 'react'
import { ADD_USER } from '../graphql/mutations'
import { GET_USER_BY_USERNAME } from '../graphql/queries';
import { useMutation } from '@apollo/client'
import { signIn } from 'next-auth/react'
import client from '../apollo-client'
import { Ring } from '@uiball/loaders';


export default function SignUpForm() {

    const projectId = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_ID
    const projectSecret = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_SECRET
    const projectIdAndSecret = `${projectId}:${projectSecret}`
    const [loading, setLoading] = useState(false)

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

    const filepickerRef = useRef(null)
    const [imageToPost, setImageToPost] = useState(null)
    const [imageToIpfs, setImageToIpfs] = useState(null)

    const [addUser] = useMutation(ADD_USER)

    const addImageToPost = (e) => {
        const reader = new FileReader();
        if (e.target.files[0]) {
            reader.readAsDataURL(e.target.files[0]);
        }

        reader.onload = (readerEvent) => {
            setImageToPost(readerEvent.target.result);
        };
        setImageToIpfs(e.target.files[0])
    }

    const removeImage = () => {
        setImageToPost(null)
        setImageToIpfs(null)
    }

    const handleSubmit = async (event) => {
        // Stop the form from submitting and refreshing the page.
        setLoading(true)
        event.preventDefault()
        let url = ''

        if (imageToIpfs) {
            const added = await ipfsClient.add(imageToIpfs)
            console.log(added)
            url = `https://postthread.infura-ipfs.io/ipfs/${added.path}`
        }

        const username = event.target.username.value
        const profile_pic = url
        const password = "password"

        // check if username already exists
        const { data: { getUserByUsername } } = await client.query({
            query: GET_USER_BY_USERNAME,
            variables: {
                username: username
            }
        })

        if (getUserByUsername) {
            toast.error("Username already exists", {
                id: "username-toast",
            })
            return
        } else {
            // add user to db
            await addUser({
                variables: {
                    username: username,
                    profile_pic: profile_pic,
                }
            })
        }

        // sign user with credential provider
        await signIn("credentials", { username, password, callbackUrl: "/" });

        setLoading(false)

        window.location = "/"
    }

    return (
        <div className="h-screen bg-base-200 py-16 px-4">
            <div className="flex flex-col items-center justify-center">
                <div className="bg-base-100 border rounded-t-2xl rounded-b-2xl shadow-sm lg:w-1/3  md:w-1/2 w-full p-10 mt-16">
                    <h3 className="text-2xl font-bold text-center">Sign up for a new account</h3>
                    <div className='flex justify-center mt-5 hover:cursor-pointer'>
                        {imageToPost ? (
                            <div onClick={removeImage} className="flex flex-col filter
                                    hover:brightness-110 transition duration-150 transform hover:scale-105
                                    cursor-pointer">
                                <img
                                    className="w-24 h-24 object-contain"
                                    src={imageToPost} />
                                <p className="text-xs text-error text-center">Remove</p>
                            </div>
                        ) :
                            <div onClick={() => filepickerRef.current.click()} className="hover:bg-base-200  p-2 rounded-full cursor-pointer " >
                                <CameraIcon className="w-24 h-24 rounded-full border p-[2px] z-0 text-base-300" />
                                <input ref={filepickerRef} onChange={addImageToPost} type="file" hidden />
                            </div>}
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="mt-4">
                            <div>
                                <label className="block">Username</label>
                                <input type="text" id="username" placeholder="Username"
                                    className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                                {/* <span className="text-xs tracking-wide text-red-600">Email field is required </span> */}
                            </div>
                            <div className="mt-4">
                                <label className="block">Password</label>
                                <input type="password" id="password" placeholder="Password"
                                    className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                            </div>
                            <div className="flex items-baseline justify-between">
                                <button type="submit" className="px-6 py-2 mt-4 text-base-content bg-primary rounded-lg hover:bg-primary-focus">
                                    <div className='flex space-x-2 items-center'>
                                        <p>Sign Up</p>
                                        {loading && <Ring size={20}
                                            speed={1.4}
                                            color="black" />}
                                    </div>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
