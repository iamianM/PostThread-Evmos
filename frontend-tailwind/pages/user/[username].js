import { useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import Posts from '../../components/Posts'
import { useEffect, useState } from 'react'
import { GET_USER_PROFILE_BY_USERNAME } from '../../graphql/queries'
import { CollectionIcon, ChatAlt2Icon, PaperAirplaneIcon, CogIcon, ShareIcon } from "@heroicons/react/outline"
import Comments from '../../components/Comments'
import ProfileCard from '../../components/ProfileCard'
import Header from '../../components/Header'
import AirdropCard from '../../components/AirdropCard'
import Settings from '../../components/Settings'
import { useSession } from 'next-auth/react'
import DisplayGraph from '../../components/DisplayGraph'

function ProfilePage() {

    const { data: session } = useSession()
    const [activeTab, setActiveTab] = useState('posts')
    const [user_id, setUser_id] = useState(null)
    const router = useRouter()
    const { data } = useQuery(GET_USER_PROFILE_BY_USERNAME, {
        variables: {
            username: router.query.username
        }
    })

    useEffect(() => {
        localStorage.getItem("user_id") ? setUser_id(localStorage.getItem("user_id")) : setUser_id(null)
    }, [session])

    const id = data?.getUserByUsername?.id
    const posts = data?.getUserByUsername?.postsList || []
    let userComments = []
    posts?.map(post => (post?.commentsList?.map(comment => {
        if (comment?.users?.username === router.query.username ||
            comment?.users?.reddit_username === router.query.username)
            userComments.push(comment)
    })))

    return (
        <div className='bg-base-200 h-auto'>
            <Header />
            <main className="flex flex-col justify-center lg:grid lg:grid-cols-3 lg:gap-10 max-w-sm md:max-w-2xl lg:max-w-5xl xl:max-w-6xl mx-auto">
                <section className="lg:col-span-1 sticky">
                    <ProfileCard
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
                        <li className="flex-1 cursor-pointer">
                            <a className="relative block p-4" onClick={() => setActiveTab('graph')}>
                                {activeTab === 'graph' && <span className="absolute inset-x-0 w-full h-px bg-primary -bottom-px"></span>}
                                <div className="flex items-center justify-center">
                                    <ShareIcon className='h-5' />
                                    <span className="ml-3 text-sm font-medium text-inherit"> Social Graph </span>
                                </div>
                            </a>
                        </li>
                        {
                            !(data?.getUserByUsername?.reddit_airdrop_claimed === "claimed") && user_id === id &&
                            <li className="flex-1 cursor-pointer">
                                <a className="relative block p-4" onClick={() => setActiveTab('airdrop')}>
                                    {activeTab === 'airdrop' && <span className="absolute inset-x-0 w-full h-px bg-primary -bottom-px"></span>}
                                    <div className="flex items-center justify-center">
                                        <PaperAirplaneIcon className='h-5' />
                                        <span className="ml-3 text-sm font-medium text-inherit"> Airdrop </span>
                                    </div>
                                </a>
                            </li>
                        }
                        {
                            user_id === id &&
                            <li className="flex-1 cursor-pointer">
                                <a className="relative block p-4" onClick={() => setActiveTab('settings')}>
                                    {activeTab === 'settings' && <span className="absolute inset-x-0 w-full h-px bg-primary -bottom-px"></span>}

                                    <div className="flex items-center justify-center">
                                        <CogIcon className='h-5' />
                                        <span className="ml-3 text-sm font-medium text-inherit"> Settings </span>
                                    </div>
                                </a>
                            </li>}
                    </ul>
                    {activeTab === 'posts' && (!posts.length > 0 ? <h1 className='text-center mt-10 font-semibold text-2xl'>No posts to show</h1> : <Posts posts={posts} showMint={user_id === id} />)}
                    {activeTab === 'comments' && (!userComments.length > 0 ? <h1 className='text-center mt-10 font-semibold text-2xl'>No comments to show</h1> : <Comments commentsToShow={userComments} />)}
                    {activeTab === 'airdrop' && <AirdropCard />}
                    {activeTab === 'settings' && <Settings id={id} />}
                    {activeTab === 'graph' && <DisplayGraph id={id} username={router.query.username} />}
                </section>
            </main>
        </div >
    )
}

export default ProfilePage