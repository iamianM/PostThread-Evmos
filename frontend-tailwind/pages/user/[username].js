import { useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import Posts from '../../components/Posts'
import { useState } from 'react'
import { GET_USER_PROFILE_BY_USERNAME } from '../../graphql/queries'
import { CollectionIcon, ChatAlt2Icon } from "@heroicons/react/outline"
import Comments from '../../components/Comments'
import ProfileCard from '../../components/ProfileCard'

function ProfilePage() {

    const [activeTab, setActiveTab] = useState('posts')
    const router = useRouter()
    const { data } = useQuery(GET_USER_PROFILE_BY_USERNAME, {
        variables: {
            username: router.query.username
        }
    })

    console.log(data?.getUserByUsername)
    const posts = data?.getUserByUsername?.postsList || []
    let comments = []
    posts?.map(post => (post?.commentsList?.map(comment => { if (comment?.users?.username === router.query.username) comments.push(comment) }))) || []

    return (
        <div className='bg-base-200 h-auto'>
            <main className="flex flex-col justify-center lg:grid lg:grid-cols-3 lg:gap-10 max-w-sm md:max-w-2xl lg:max-w-5xl xl:max-w-6xl mx-auto">
                <section className="lg:col-span-1 sticky">
                    <ProfileCard
                        username={data?.getUserByUsername?.username}
                        profile_pic={data?.getUserByUsername?.profile_pic}
                        created_at={data?.getUserByUsername?.created_at}
                        id={data?.getUserByUsername?.id} />
                </section>
                <section className="lg:col-span-2 mb-10 mt-5">
                    <ul className="flex border-b border-gray-100">
                        <li className="flex-1 cursor-pointer">
                            <a className="relative block p-4" onClick={() => setActiveTab('posts')}>
                                {activeTab === 'posts' && <span className="absolute inset-x-0 w-full h-px bg-primary -bottom-px"></span>}

                                <div className="flex items-center justify-center">
                                    <CollectionIcon className='h-5' />
                                    <span className="ml-3 text-sm font-medium text-inherit"> Posts </span>
                                </div>
                            </a>
                        </li>

                        <li className="flex-1 cursor-pointer">
                            <a className="relative block p-4" onClick={() => setActiveTab('comments')}>
                                {activeTab === 'comments' && <span className="absolute inset-x-0 w-full h-px bg-primary -bottom-px"></span>}
                                <div className="flex items-center justify-center">
                                    <ChatAlt2Icon className='h-5' />
                                    <span className="ml-3 text-sm font-medium text-inherit"> Comments </span>
                                </div>
                            </a>
                        </li>
                    </ul>
                    {activeTab === 'posts' && <Posts posts={posts} />}
                    {activeTab === 'comments' && <Comments commentsToShow={comments} />}
                </section>
            </main>
        </div >
    )
}

export default ProfilePage