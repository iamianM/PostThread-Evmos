import Head from 'next/head'
import Feed from '../components/Feed'
import Modal from '../components/Modal'

const Home = () => {
    return (
        <div className="bg-base-200 h-screen overflow-y-scroll scrollbar-hide">
            <Head>
                <title>PostThread</title>
                <link rel="icon" href="/postthreadicon.png" />
            </Head>
            <Feed />
        </div>
    )
}

export default Home
