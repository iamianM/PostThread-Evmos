import { useForm } from 'react-hook-form';
import { CameraIcon } from "@heroicons/react/solid"
import { useRef, useState } from "react"
import toast from "react-hot-toast"
import { GET_CATEGORY_BY_NAME } from "../graphql/queries"
import { useMutation } from '@apollo/client';
import { ADD_POST, ADD_CATEGORY } from "../graphql/mutations";
import client from "../apollo-client"
import { useSession } from 'next-auth/react';
import { create } from 'ipfs-http-client';

function PostBox({ category, refetch }) {

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

    const filepickerRef = useRef(null)
    const [imageToPost, setImageToPost] = useState(null)
    const [imageToIpfs, setImageToIpfs] = useState(null)

    const [addPost] = useMutation(ADD_POST)
    const [addCategory] = useMutation(ADD_CATEGORY)
    const { data: session } = useSession()

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm();

    const onSubmit = handleSubmit(async (data) => {

        toast.loading("Creating new post...", {
            id: "post-toast",
        })

        try {

            const { data: { getCategoryByName } } = await client.query({
                query: GET_CATEGORY_BY_NAME,
                variables: {
                    name: category || data.category
                }
            })

            const categoryExists = !!getCategoryByName?.id
            console.log(categoryExists)
            let url = ''
            let category_id = getCategoryByName?.id ?? 0

            if (imageToIpfs) {
                const added = await ipfsClient.add(imageToIpfs)
                console.log(added)
                url = `https://postthread.infura-ipfs.io/ipfs/${added.path}`
            }


            if (!categoryExists) {
                const { data: { insertCategories: newCategory } } = await addCategory({
                    variables: {
                        name: data.category
                    }
                })

                category_id = newCategory?.id
                console.log(newCategory)
            }

            const post = JSON.stringify({
                body: data.body,
                url: url,
                title: data.title,
                user_id: localStorage.getItem('user_id'),
                category_id: category_id
            })

            const added = await ipfsClient.add(post)
            console.log(added)
            const postUrl = `https://postthread.infura-ipfs.io/ipfs/${added.path}`

            console.log(postUrl)

            const { data: { insertPosts: newPost } } = await addPost({
                variables: {
                    body: data.body,
                    url: url,
                    title: data.title,
                    user_id: localStorage.getItem('user_id'),
                    category_id: category_id,
                    ipfs_hash: postUrl
                }
            })

            console.log(newPost)

            refetch()
            toast.success("Post created!", {
                id: "post-toast",
            })
        } catch (error) {
            toast.error("Whoops! Something went wrong.", {
                id: "post-toast",
            })
        }

        setValue("body", "")
        setValue("title", "")
        setValue("category", "")
        setImageToPost(null)

    })

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




    return (
        <form onSubmit={onSubmit} className="bg-base-100 p-2 rounded-2xl shadow-lg border text-base-content font-medium mt-10">
            <div className="flex space-x-4 items-center p-4">
                <img
                    className="rounded-full cursor-pointer w-10 h-10"
                    src={session?.user?.image ?? session?.user[0]?.profile_pic}
                />
                <input
                    {...register('title', { required: true })}
                    className="rounded-xl h-12 bg-base-100 border-primary focus:ring-primary focus:border-primary flex-grow px-5 focus:outline-none"
                    type="text"
                    placeholder={session ? category ? `Create a post in p/${category}` : "Create a post by entering a title!" : "Sign in to post"} />

                {imageToPost ? (
                    <div onClick={removeImage} className="flex flex-col filter
                    hover:brightness-110 transition duration-150 transform hover:scale-105
                    cursor-pointer">
                        <img
                            className="h-10 object-contain"
                            src={imageToPost} />
                        <p className="text-xs text-error text-center">Remove</p>
                    </div>
                ) :
                    <div onClick={() => filepickerRef.current.click()} className="hover:bg-base-200  p-2 rounded-full cursor-pointer " >
                        <CameraIcon className="h-7 text-success" />
                        <input ref={filepickerRef} onChange={addImageToPost} type="file" hidden />
                    </div>}
            </div>

            {!!watch('title') && (
                <div className='flex flex-col py-2'>
                    <div className='flex items-center p-2'>
                        <p className='min-w-[90px] font-semibold'>Body:</p>
                        <input
                            {...register('body', { required: false })}
                            className="rounded-xl flex-1 h-12 bg-base-100 border-primary focus:ring-primary focus:border-primary flex-grow px-5 focus:outline-none"
                            type="text"
                            placeholder="Text (optional)" />
                    </div>

                    {!category && (
                        <div className='flex items-center p-2'>
                            <p className='min-w-[90px] font-semibold'>Category:</p>
                            <input
                                {...register('category', { required: true })}
                                className="rounded-xl flex-1 h-12 bg-base-100 border-primary focus:ring-primary focus:border-primary flex-grow px-5 focus:outline-none"
                                type="text"
                                placeholder="i.e. Web3" />
                        </div>
                    )}

                    {Object.keys(errors).length > 0 && (
                        <div className='space-y-2 p-2 text-error'>
                            {errors.title?.type === 'required' && (
                                <p>- A post title is required</p>
                            )}
                            {errors.category?.type === 'required' && (
                                <p>- A category is required</p>
                            )}
                        </div>
                    )}

                    {!!watch('title') &&
                        <button className='flex justify-center text-base-100 mt-2 py-2 rounded-full bg-primary hover:bg-primary-focus' type="submit">
                            Create post
                        </button>}
                </div>
            )}
        </form>
    )
}

export default PostBox