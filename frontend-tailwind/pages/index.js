import Head from 'next/head'
import Feed from '../components/Feed'
import Header from '../components/Header'

const Home = () => {

    return (
        <div className="bg-base-200 h-screen overflow-y-scroll scrollbar-hide">
            <Head>
                <title>PostThread</title>
                <link rel="icon" href="/postthreadicon.png" />
            </Head>
            <Header />
            <Feed />
        </div>
    )
}

export default Home
