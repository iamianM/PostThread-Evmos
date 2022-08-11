import { GET_USER_LIST_LIMIT } from "../graphql/queries";
import { useQuery } from '@apollo/client';
import Link from "next/link";

function Suggestions() {

    const { data } = useQuery(GET_USER_LIST_LIMIT, {
        variables: {
            limit: 10
        }
    })

    const suggestions = data?.getUserListLimit || []

    return (
        <div className="mt-4 bg-base-100 ml-10 my-7 p-5 border rounded-t-2xl rounded-b-2xl shadow-sm">
            <div className="flex justify-between text-sm mb-5">
                <h3 className="text-sm font-bold text-gray-400">Suggestions for you</h3>
                <button className="text-gray-600 font-semibold">See All</button>
            </div>
            {
                suggestions.map(profile => (
                    <div key={profile.id} className="flex items-center justify-between mt-3">
                        <img className="w-10 h-10 rounded-full border p-[2px]" src={profile.profile_pic} />
                        <Link href={`/user/${profile.username}`}>
                            <div className="flex-1 ml-4 hover:text-info hover:underline cursor-pointer">
                                <h2 className="font-semibold text-sm">{profile.username}</h2>
                            </div>
                        </Link>
                        <button className="text-primary text-xs font-semibold">Follow</button>
                    </div>
                ))
            }
        </div>
    )
}

export default Suggestions