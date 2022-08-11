import { signOut, useSession } from "next-auth/react"
import Link from "next/link"

function MiniProfile({ image, name }) {

    return (
        <div className="flex bg-base-100 rounded-t-2xl rounded-b-2xl p-3 items-center justify-between mt-11 ml-10">
            <img className="w-16 h-16 rounded-full border p-[2px]" src={image} alt="profile" />
            <div className="flex-1 mx-4" >
                <Link href={`/user/${name}`}>
                    <h2 className="font-bold hover:text-info hover:underline cursor-pointer">{name}</h2>
                </Link>
                <h3 className="text-sm text-base-50">Welcome to PostThread</h3>
            </div>
            <button className="text-primary text-sm font-semibold" onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</button>
        </div>
    )
}

export default MiniProfile