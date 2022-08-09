import { useForm } from 'react-hook-form';
import { CameraIcon } from "@heroicons/react/solid"
import { useRef, useState } from "react"
import toast from "react-hot-toast"
import { GET_CATEGORY_BY_NAME, GET_USER_BY_USERNAME, GET_ALL_POSTS } from "../graphql/queries"
import { useMutation } from '@apollo/client';
import { ADD_POST, ADD_CATEGORY } from "../graphql/mutations";
import client from "../apollo-client"
import { useSession } from 'next-auth/react';

function PostBox() {

    const filepickerRef = useRef(null)
    const [imageToPost, setImageToPost] = useState(null)
    const [addPost] = useMutation(ADD_POST, {
        refetchQueries: [
            GET_ALL_POSTS,
            'getPostList'
        ]
    })
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

        // const notification = toast.loading("Creating new post...")

        // try {

        const { data: { getCategoryByName } } = await client.query({
            query: GET_CATEGORY_BY_NAME,
            variables: {
                name: data.category
            }
        })

        console.log(getCategoryByName)

        const categoryExists = getCategoryByName?.id > 0
        const url = imageToPost || ''

        console.log(categoryExists)

        if (!categoryExists) {
            const { data: { insertCategory: newCategory } } = await addCategory({
                variables: {
                    name: data.category
                }
            })

            const { data: { insertPost: newPost } } = await addPost({
                variables: {
                    body: data.body,
                    url: url,
                    title: data.title,
                    user_id: localStorage.getItem('user_id'),
                    category_id: newCategory.id
                }
            })

            console.log(newPost)
        } else {
            const { data: { insertPost: newPost } } = await addPost({
                variables: {
                    body: data.body,
                    url: url,
                    title: data.title,
                    category_id: getCategoryByName.id,
                    user_id: localStorage.getItem('user_id')
                }
            })

            console.log(newPost)
            // toast.success("Post created!", {
            //     id: notification
            // })
        }
        // } catch (error) {
        //     // toast.error("Whoops! Something went wrong.", {
        //     //     id: notification
        //     // })
        // }

        // setValue("body", "")
        // setValue("title", "")
        // setValue("category", "")
        // setImageToPost(null)

    })

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
        <form onSubmit={onSubmit} className="bg-base-100 p-2 rounded-2xl shadow-lg border text-base-content font-medium mt-6">
            <div className="flex space-x-4 items-center p-4">
                <img
                    className="rounded-full cursor-pointer w-10 h-10"
                    src={session.user.image}
                />
                <input
                    {...register('title', { required: true })}
                    className="rounded-xl h-12 bg-base-100 border-primary focus:ring-primary focus:border-primary flex-grow px-5 focus:outline-none"
                    type="text"
                    placeholder="Create a post by entering a title!" />


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
                    <div className='flex items-center p-2'>
                        <p className='min-w-[90px] font-semibold'>Category:</p>
                        <input
                            {...register('category', { required: true })}
                            className="rounded-xl flex-1 h-12 bg-base-100 border-primary focus:ring-primary focus:border-primary flex-grow px-5 focus:outline-none"
                            type="text"
                            placeholder="i.e. Web3" />
                    </div>

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