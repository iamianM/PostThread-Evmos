import Head from 'next/head'
import Feed from '../components/Feed'
import Header from '../components/Header'
import Modal from '../components/Modal'

const Home = () => {
    return (
        <div className="bg-base-100 h-screen overflow-y-scroll scrollbar-hide">
            <Head>
                <title>PostThread</title>
                <link rel="icon" href="/postthreadicon.png" />
            </Head>
            <Header />
            <Feed />
            <Modal />
        </div>
    )
}

export default Home
