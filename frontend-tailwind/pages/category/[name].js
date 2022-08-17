import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';
import { faker } from "@faker-js/faker";
import PostBox from '../../components/PostBox';
import { GET_POSTS_BY_CATEGORY } from "../../graphql/queries"
import { useQuery } from '@apollo/client';
import Posts from '../../components/Posts';
import { JellyTriangle } from "@uiball/loaders"
import Header from '../../components/Header';
import InfiniteScroll from 'react-infinite-scroller';
import { useSession } from 'next-auth/react';

function CategoryPage() {

    const { data: session } = useSession();
    const { query: { name } } = useRouter()
    const [avatar, setAvatar] = useState(null)
    const { data, fetchMore, refetch } = useQuery(GET_POSTS_BY_CATEGORY, {
        variables: {
            name: name,
            offset: 0,
            limit: 10
        }
    })

    useEffect(() => {
        function createRandomAvatar() {
            setAvatar(faker.image.image())
        }

        if (!avatar) {
            createRandomAvatar()
        }
    }, [])

    if (!data?.getPostListByCategory.length > 0) {
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
            <div className='bg-base-200 h-full scrollbar-hide'>
                <Header />
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
                <div className='mx-auto h-screen overflow-auto scrollbar-hide max-w-3xl mt-12 pb-10'>
                    <InfiniteScroll
                        pageStart={0}
                        loadMore={() => {
                            fetchMore({
                                variables: {
                                    name: name,
                                    offset: data?.getPostListByCategory.length,
                                    limit: 10
                                },
                                updateQuery: (prev, { fetchMoreResult }) => {
                                    if (!fetchMoreResult) return prev
                                    return Object.assign({}, prev, {
                                        getPostListByCategory: [...prev.getPostListByCategory, ...fetchMoreResult.getPostListByCategory]
                                    })
                                }
                            })
                        }}
                        hasMore={data?.getPostListByCategory.length > 0}
                        useWindow={false}>
                        {session && <PostBox category={name} refetch={refetch} />}
                        {<Posts posts={data?.getPostListByCategory} />}
                    </InfiniteScroll>
                </div>
            </div>
        )
    }
}

export default CategoryPage