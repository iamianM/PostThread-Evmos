import Image from "next/image"
import {
    SearchIcon,
    PlusCircleIcon,
    UserGroupIcon,
    BellIcon,
    PaperAirplaneIcon,
    MenuIcon,
} from "@heroicons/react/outline"
import { HomeIcon } from "@heroicons/react/solid"
import { useRouter } from "next/router"
import ThemeSelector from "./ThemeSelector";
import { useSession } from "next-auth/react"
import { signIn } from "next-auth/react"
import SearchBar from "./SearchBar"
import ConnectWallet from "./ConnectWallet";


function Header() {

    const router = useRouter()
    const { data: session } = useSession()

    return (
        <div className="shadow-sm borderb-b bg-primary sticky top-0 z-50 ">
            <div className="flex justify-between items-center bg-primary max-w-6xl mx-5 lg:mx-auto">
                {/* Left */}
                <div onClick={() => { router.push("/") }} className="relative md:hidden h-10 w-10 flex-shrink-0 cursor-pointer">
                    <Image src="/postthreadicon.png" layout="fill" objectFit="contain" />
                </div>
                <div className="flex items-center space-x-4">
                    <div onClick={() => { router.push("/") }} className="relative hidden md:inline-grid h-12 w-12 cursor-pointer">
                        <img src="/postthreadicon.png" />
                    </div>
                    <a onClick={() => { router.push("/") }} className="font-bold text-xl relative hidden md:inline-grid cursor-pointer text-base-content">
                        PostThread
                    </a>
                </div>
                <div>
                    <ConnectWallet />
                </div>
                {/* Middle */}
                <div className="max-w-lg flex items-center">
                    <SearchBar placeholder="Search an user..." />
                    <div className="hidden lg:inline-block">
                        <ThemeSelector />
                    </div>
                </div>
                {/* Right */}
                <div className="flex items-center justify-end space-x-4">
                    {session ? (
                        <>
                            <HomeIcon onClick={() => { router.push("/") }} className="navBtn" />
                            <MenuIcon className="h-6 md:hidden cursor-pointer" />
                            <div className="relative navBtn">
                                <PaperAirplaneIcon className="navBtn" />
                                <div
                                    className="absolute -top-2 -right-3 text-xs w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse text-white">3</div>
                            </div>
                            <UserGroupIcon className="navBtn" />
                            <div className="relative navBtn">
                                <BellIcon className="navBtn" />
                                <div
                                    className="absolute -top-2 -right-3 text-xs w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse text-white">3</div>
                            </div>
                            <div className="hidden lg:flex cursor-pointer">
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={session?.user?.image ?? session?.user[0]?.profile_pic}
                                        className="rounded-full h-6 w-6 cursor-pointer" />
                                </div>
                            </div>
                        </>)
                        :
                        (<button onClick={signIn}>Sign in</button>)}
                </div>


            </div>
        </div>
    )
}

export default Header