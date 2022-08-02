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
import { useRecoilState } from "recoil"
import { modalState } from "../atoms/modalAtom"
import ThemeSelector from "./ThemeSelector";

function Header() {

    const [open, setOpen] = useRecoilState(modalState)
    const router = useRouter()

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
                    <a onClick={() => { router.push("/") }} className="font-bold text-xl relative hidden md:inline-grid cursor-pointer text-base-100">
                        PostThread
                    </a>
                </div>
                {/* Middle */}
                <div className="max-w-xs flex items-center">
                    <div className="relative p-3 rounded-md">
                        <div className="absolute inset-y-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-500 " />
                        </div>
                        <input type="text" placeholder="Search"
                            className="bg-base-100 block w-full pl-10 sm:text-sm border-base-200 rounded-md focus:ring-black focus:border-black" />
                    </div>
                    <ThemeSelector />
                </div>
                {/* Right */}
                <div className="flex items-center justify-end space-x-4">
                    <HomeIcon onClick={() => { router.push("/") }} className="navBtn" />
                    <MenuIcon className="h-6 md:hidden cursor-pointer" />
                    <>
                        <div className="relative navBtn">
                            <PaperAirplaneIcon className="navBtn" />
                            <div
                                className="absolute -top-2 -right-3 text-xs w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse text-white">3</div>
                        </div>
                        <PlusCircleIcon onClick={() => setOpen(true)} className="navBtn" />
                        <UserGroupIcon className="navBtn" />
                        <div className="relative navBtn">
                            <BellIcon className="navBtn" />
                            <div
                                className="absolute -top-2 -right-3 text-xs w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse text-white">3</div>
                        </div>
                        {/* <img
                        onClick={signOut}
                        src={session?.user?.image}
                        className="rounded-full h-10 w-10 cursor-pointer" /> */}
                    </>
                </div>


            </div>
        </div>
    )
}

export default Header