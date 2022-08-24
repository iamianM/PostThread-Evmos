import MiniProfile from "./MiniProfile"
import Suggestions from "./Suggestions"
import Trending from "./Trending"
import { useSession } from 'next-auth/react'

function RightSection() {
    const { data: session } = useSession()

    return (
        <>
            <div>
                {session &&
                    <>
                        <MiniProfile image={session?.user?.image ?? session?.user[0]?.profile_pic} name={session?.user?.name || session?.user?.username || session?.user[0]?.username} />
                        <Suggestions />
                    </>}
                <Trending />
            </div>
        </>
    )
}

export default RightSection