import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';
import { faker } from "@faker-js/faker";
import PostBox from '../../components/PostBox';
import { GET_POSTS_BY_CATEGORY } from "../../graphql/queries"
import { useQuery } from '@apollo/client';
import Posts from '../../components/Posts';

function CategoryPage() {

    const { query: { name } } = useRouter()
    const [avatar, setAvatar] = useState(null)
    const { data, error } = useQuery(GET_POSTS_BY_CATEGORY, {
        variables: { name: name }
    })
    const posts = data?.getPostListByCategory || []

    useEffect(() => {
        function createRandomAvatar() {
            setAvatar(faker.image.image())
        }

        if (!avatar) {
            createRandomAvatar()
        }
    }, [])


    return (
        <div className='bg-base-200'>
            <div className='h-24 bg-secondary p-8'>
                <div className='-mx-8 mt-10 bg-base-100'>
                    <div className='mx-auto flex max-w-3xl items-center space-x-4 pb-3'>
                        <div className='-mt-5'>
                            <img className="w-20 h-20 rounded-full border p-[2px]" src={avatar} />
                        </div>
                        <div className='py-2'>
                            <h1 className='text-4-xl font-semibold'>
                                Welcome to the p/{name} category
                            </h1>
                            <p className='text-sm text-base-300'>p/{name}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className='mx-auto max-w-3xl mt-20 pb-10'>
                <PostBox category={name} />
                <Posts posts={posts} />
            </div>
        </div>
    )
}

export default CategoryPage