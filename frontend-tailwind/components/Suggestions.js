import { GET_LATEST_USERS } from "../graphql/queries";
import { useQuery } from '@apollo/client';
import Link from "next/link";
import SuggestionRow from "./SuggestionRow";

function Suggestions() {

    const { data } = useQuery(GET_LATEST_USERS, {
        variables: {
            limit: 4
        }
    })

    const suggestions = data?.getLatestUsers || []

    return (
        <div className="mt-4 bg-base-100 ml-10 my-7 p-5 border rounded-t-2xl rounded-b-2xl shadow-sm">
            <div className="flex justify-between text-sm mb-5">
                <h3 className="text-sm font-bold text-gray-400">Suggestions for you</h3>
                <button className="text-gray-600 font-semibold">See All</button>
            </div>
            {
                suggestions.map(profile => (
                    <SuggestionRow key={profile.id} profile={profile} />
                ))
            }
        </div>
    )
}

export default Suggestions