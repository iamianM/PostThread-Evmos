import Head from 'next/head'
import Feed from '../components/Feed'
import Header from '../components/Header'
import RightSection from '../components/RightSection'

const Home = () => {

    return (
        <div className="bg-base-200 h-screen overflow-y-scroll scrollbar-hide">
            <Head>
                <title>PostThread</title>
                <link rel="icon" href="/postthreadicon.png" />
            </Head>
            <Header />
            <div>
                <main className="grid grid-cols-1 max-w-sm md:max-w-2xl lg:grid-cols-3 lg:max-w-5xl 
                                xl:max-w-6xl mx-auto scrollbar-hide">
                    <section className="col-span-2 h-screen rounded-b-2xl scrollbar-hide overflow-auto">
                        <Feed />
                    </section>
                    <section className="hidden lg:inline-grid md:col-span-1 ">
                        <RightSection />
                    </section>
                </main>
            </div>
        </div>
    )
}

export default Home
