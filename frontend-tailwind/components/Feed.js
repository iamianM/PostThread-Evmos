import InputBox from "./InputBox"
import Posts from "./Posts"
import MiniProfile from "./MiniProfile"
import Suggestions from "./Suggestions"
import Trending from "./Trending"

function Feed() {

    return (
        <main className={`grid grid-cols-1 max-w-sm md:max-w-2xl lg:grid-cols-3 lg:max-w-5xl 
        xl:max-w-6xl mx-auto`}>
            <section className="col-span-2">
                <InputBox />
                <Posts />
            </section>
            <section className="hidden lg:inline-grid md:col-span-1 ">
                <div className="mt-1">
                    <MiniProfile />
                    <Suggestions />
                    <Trending />
                </div>
            </section>
        </main>
    )
}

export default Feed