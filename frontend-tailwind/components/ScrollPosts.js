import { useSession } from 'next-auth/react'
import InfiniteScroll from 'react-infinite-scroller'
import Posts from './Posts'
import PostBox from './PostBox'
import { Ring } from '@uiball/loaders'
import { FireIcon, ChevronDoubleUpIcon } from "@heroicons/react/solid"

function ScrollPosts({ data, fetchMore, order_by, setFilter, refetch }) {

    const { data: session } = useSession()

    return (
        <>
            {session && <PostBox refetch={refetch} />}
            {/* <ul className="flex border shadow-sm mt-7 border-gray-100 bg-base-100">
                <li className="flex-1 cursor-pointer hover:bg-base-200">
                    <a className="relative block p-4" onClick={() => {
                        setFilter('reddit_upvotes')
                        refetch()
                    }}>
                        {order_by === 'reddit_upvotes' && <span className="absolute inset-x-0 w-full h-px bg-primary -bottom-px"></span>}
                        <div className="flex items-center justify-center">
                            <FireIcon className='h-5' />
                            <span className="ml-3 text-sm font-medium uppercase text-inherit"> Top </span>
                        </div>
                    </a>
                </li>
                <li className="flex-1 cursor-pointer hover:bg-base-200">
                    <a className="relative block p-4" onClick={() => {
                        setFilter('created_at')
                        refetch()
                    }}>
                        {order_by === 'created_at' && <span className="absolute inset-x-0 w-full h-px bg-primary -bottom-px"></span>}
                        <div className="flex items-center justify-center">
                            <ChevronDoubleUpIcon className='h-5' />
                            <span className="ml-3 text-sm font-medium uppercase text-inherit"> New </span>
                        </div>
                    </a>
                </li>
            </ul> */}
            <InfiniteScroll
                pageStart={0}
                loadMore={() => {
                    fetchMore({
                        variables: {
                            limit: 10,
                            offset: data?.getLatestPosts.length,
                        },
                        updateQuery: (prev, { fetchMoreResult }) => {
                            if (!fetchMoreResult) return prev
                            return Object.assign({}, prev, {
                                getLatestPosts: [...prev.getLatestPosts, ...fetchMoreResult.getLatestPosts]
                            })
                        }
                    })
                }}
                loader={
                    <div className="flex justify-center">
                        <Ring
                            size={50}
                            speed={1.4}
                            color="black" />
                    </div>}
                hasMore={data?.getLatestPosts.length > 0}
                useWindow={false}>
                {<Posts posts={data?.getLatestPosts} />}
            </InfiniteScroll>
        </>
    )
}

export default ScrollPosts