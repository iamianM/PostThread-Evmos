import { signIn, getProviders, signOut, useSession } from 'next-auth/react'
import Login from '../../components/Login'

const Signin = ({ providers }) => {

    const { data: session } = useSession(null)

    return (
        <div className="h-screen bg-base-200 py-16 px-4">
            <div className="flex flex-col items-center justify-center">
                <div className="bg-base-100 border rounded-t-2xl rounded-b-2xl shadow-sm lg:w-1/3  md:w-1/2 w-full p-10 mt-16">
                    {
                        !session &&
                        <p tabIndex="0" className="focus:outline-none text-2xl font-extrabold leading-6 text-inherit">Sign in</p>
                    }
                    {
                        providers && !session &&
                        Object.values(providers).map(provider => (
                            <div key={provider.name} className="mb-0">
                                <button onClick={() => signIn(provider.id, { callbackUrl: "/" })} className={`py-3.5 px-4 border rounded-lg border-primary-focus flex items-center w-full mt-4 bg-base-100`}>
                                    <Login type={provider.name} />
                                </button>
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