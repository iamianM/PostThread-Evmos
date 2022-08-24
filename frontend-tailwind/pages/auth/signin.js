import { signIn, getProviders } from 'next-auth/react'
import Login from '../../components/Login'
import Image from 'next/image'
import Link from 'next/link'
import { GET_USER_HASHED_PASSWORD } from '../../graphql/queries'
import client from '../../apollo-client'
import bcrypt from 'bcryptjs'
import toast from 'react-hot-toast'
import { Ring } from '@uiball/loaders';
import { useState } from 'react'


const Signin = ({ providers }) => {

    const [loading, setLoading] = useState(false)

    const handleSubmit = async (event) => {
        // Stop the form from submitting and refreshing the page.
        event.preventDefault()
        setLoading(true)

        const username = event.target.username.value
        const password = event.target.password.value

        // check password
        const { data: { getUserByUsername } } = await client.query({
            query: GET_USER_HASHED_PASSWORD,
            variables: {
                username: username
            }
        })

        const hashedPassword = getUserByUsername?.password
        const result = bcrypt.compareSync(password, hashedPassword)

        if (result) {
            await signIn("credentials", { username, password, callbackUrl: "/" });
        } else {
            toast.error("Incorrect password", {
                id: "password-toast",
            })
        }
        setLoading(false)
    }

    return (
        <div className="h-screen bg-base-200 px-4">
            <div className="flex flex-col items-center justify-center">
                <div className="bg-base-100 border rounded-t-2xl rounded-b-2xl shadow-sm lg:w-1/3  md:w-1/2 w-full p-10 mt-5 mb-10">
                    <div className="flex justify-center">
                        <Image src="/postthreadicon.png" height={80} width={80} />
                    </div>
                    <h3 className="text-2xl font-bold text-center">Login to your account</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mt-4">
                            <div>
                                <label className="block">Username</label>
                                <input type="text" id="username" placeholder="Username"
                                    className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                                {/* <span className="text-xs tracking-wide text-red-600">Email field is required </span> */}
                            </div>
                            <div className="mt-4">
                                <label className="block">Password</label>
                                <input type="password" id="password" placeholder="Password"
                                    className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                            </div>
                            <div className="flex items-baseline justify-between">
                                <button type="submit" className="px-6 py-2 mt-4 text-base-content bg-primary rounded-lg hover:bg-primary-focus">
                                    <div className='flex space-x-2 items-center'>
                                        <p>Login</p>
                                        {loading && <Ring size={20}
                                            speed={1.4}
                                            color="black" />}
                                    </div>
                                </button>
                                <Link href="/signup">
                                    <a className='cursor-pointer hover:underline'>Sign up</a>
                                </Link>
                            </div>
                        </div>
                    </form>
                    <p tabIndex="0" className="focus:outline-none text-2xl mt-5 font-extrabold leading-6 text-inherit">Or sign in</p>
                    {
                        providers &&
                        Object.values(providers).map(provider => (
                            <div key={provider.name} className="mb-0">
                                {provider.name !== "credentials" &&
                                    <button onClick={() => signIn(provider.id, { callbackUrl: "/" })} className={`py-3.5 px-4 border rounded-lg border-primary-focus flex items-center w-full mt-4 bg-base-100`}>
                                        <Login type={provider.name} />
                                    </button>}
                            </div>
                        ))

                    }
                </div>
            </div>
        </div >
    )
}

export default Signin

export async function getServerSideProps() {
    const providers = await getProviders()
    return {
        props: {
            providers,
        },
    }
}