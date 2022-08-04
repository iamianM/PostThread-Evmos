import { signOut, useSession } from "next-auth/react"

function MiniProfile() {

    // const { data: session } = useSession()

    return (
        <div className="flex bg-base-100 rounded-t-2xl rounded-b-2xl p-3 items-center justify-between mt-14 ml-10">
            <img className="w-16 h-16 rounded-full border p-[2px]" src="/postthreadicon.png" alt="profile" />
            <div className="flex-1 mx-4" >
                <h2 className="font-bold">pules</h2>
                <h3 className="text-sm text-base-50">Welcome to PostThread</h3>
            </div>
            <button className="text-primary text-sm font-semibold">Sign Out</button>
        </div>
    )
}

export default MiniProfile