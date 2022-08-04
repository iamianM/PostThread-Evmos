import { useEffect } from "react"
import { useState } from "react"
import { faker } from "@faker-js/faker";


function Suggestions() {

    const [suggestions, setSuggestions] = useState([])

    useEffect(() => {
        function createRandomUser() {
            return {
                username: faker.internet.userName(),
                email: faker.internet.email(),
                avatar: faker.image.avatar(),
                password: faker.internet.password(),
                birthdate: faker.date.birthdate(),
                registeredAt: faker.date.past(),
            };
        }

        const users = [...Array(5)].map((_, i) => ({
            ...createRandomUser(),
            id: i,
        }))

        setSuggestions(users)
    }, [])

    return (
        <div className="mt-4 bg-base-100 ml-10 my-7 p-5 border rounded-t-2xl rounded-b-2xl shadow-sm">
            <div className="flex justify-between text-sm mb-5">
                <h3 className="text-sm font-bold text-gray-400">Suggestions for you</h3>
                <button className="text-gray-600 font-semibold">See All</button>
            </div>
            {
                suggestions.map(profile => (
                    <div key={profile.id} className="flex items-center justify-between mt-3">
                        <img className="w-10 h-10 rounded-full border p-[2px]" src={profile.avatar} />
                        <div className="flex-1 ml-4">
                            <h2 className="font-semibold text-sm">{profile.username}</h2>
                        </div>
                        <button className="text-primary text-xs font-semibold">Follow</button>
                    </div>
                ))
            }
        </div>
    )
}

export default Suggestions