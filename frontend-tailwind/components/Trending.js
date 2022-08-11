import { faker } from "@faker-js/faker";
import { GET_CATEGORIES_LIST_LIMIT } from "../graphql/queries";
import { useQuery } from '@apollo/client';
import Link from "next/link";

function Trending() {

    const { data } = useQuery(GET_CATEGORIES_LIST_LIMIT, {
        variables: {
            limit: 10
        }
    })

    const topics = data?.getCategoryListLimit || []

    return (
        <div className="mt-4 ml-10 my-7 bg-base-100 p-5 border rounded-t-2xl rounded-b-2xl shadow-sm">
            <div className="flex justify-between text-sm mb-5">
                <h3 className="text-sm font-bold text-gray-400">Trending topics</h3>
                <button className="text-gray-600 font-semibold">See All</button>
            </div>
            {
                topics.map(topic => (
                    <div key={topic.id} className="flex items-center justify-between mt-3">
                        <img className="w-10 h-10 rounded-full border p-[2px]" src={faker.image.image()} />
                        <Link href={`/category/${topic.name}`}>
                            <div className="flex-1 ml-4 hover:text-info hover:underline cursor-pointer">
                                <h2 className="font-semibold text-sm">p/{topic.name}</h2>
                            </div>
                        </Link>
                    </div>
                ))
            }
        </div>
    )
}

export default Trending