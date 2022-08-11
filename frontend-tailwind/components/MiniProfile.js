import { signOut, useSession } from "next-auth/react"

function MiniProfile({ image, name }) {

    return (
        <div className="flex bg-base-100 rounded-t-2xl rounded-b-2xl p-3 items-center justify-between mt-11 ml-10">
            <img className="w-16 h-16 rounded-full border p-[2px]" src={image} alt="profile" />
            <div className="flex-1 mx-4" >
                <h2 className="font-bold">{name}</h2>
                <h3 className="text-sm text-base-50">Welcome to PostThread</h3>
            </div>
            <button className="text-primary text-sm font-semibold" onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</button>
        </div>
    )
}

export default MiniProfile