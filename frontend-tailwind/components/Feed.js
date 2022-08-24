import MiniProfile from "./MiniProfile"
import Suggestions from "./Suggestions"
import Trending from "./Trending"
import { useQuery } from "@apollo/client"
import { GET_USER_BY_USERNAME, GET_FILTERED_POSTS, GET_LATEST_POSTS, GET_TOP_POSTS } from "../graphql/queries"
import { useSession } from 'next-auth/react'
import { useEffect } from "react"
import { ADD_USER } from "../graphql/mutations";
import client from "../apollo-client"
import { JellyTriangle } from "@uiball/loaders"
import { useState } from "react"
import ScrollPosts from "./ScrollPosts"

function Feed() {

    const { data: session } = useSession()
    const [filter, setFilter] = useState("created_at")

    // switch (filter) {
    //     case "created_at":
    //         const { data: latestData, fetchMore: latestFetchMore, refetch: latestRefetch } = useQuery(GET_LATEST_POSTS, {
    //             variables: {
    //                 limit: 10,
    //                 offset: 0,
    //             }
    //         })
    //     case "reddit_upvotes":
    //         const { data: topData, fetchMore: topFetchMore, refetch: topRefetch } = useQuery(GET_TOP_POSTS, {
    //             variables: {
    //                 limit: 10,
    //                 offset: 0,
    //             }
    //         })
    // }

    const { data, fetchMore, refetch } = useQuery(GET_LATEST_POSTS, {
        variables: {
            limit: 10,
            offset: 0,
        }
    })

    console.log(session)

    useEffect(() => {
        const registerUser = async () => {
            const { data: { getUserByUsername } } = await client.query({
                query: GET_USER_BY_USERNAME,
                variables: {
                    username: session?.user?.name || session?.user?.username || session?.user[0]?.username
                }
            })

            const userExists = getUserByUsername?.id > 0

            if (!userExists) {
                const { data: { insertUsers: newUser } } = await client.mutate({
                    mutation: ADD_USER,
                    variables: {
                        username: session?.user?.name || session?.user?.username || session?.user[0]?.username,
                        profile_pic: session?.user?.image ?? session?.user[0]?.profile_pic
                    }
                })

                console.log("creating new user")

                localStorage.setItem("user_id", newUser.id)
            } else {
                localStorage.setItem("user_id", getUserByUsername.id)
            }
        }

        if (session) { registerUser() }
    }, [session])

    return (
        <>
            {!data?.getLatestPosts.length > 0 ? (
                <div className="flex w-full h-screen items-center justify-center p-10 text-3-xl">
                    <JellyTriangle
                        size={50}
                        speed={1.4}
                        color="black"
                    />
                </div>
            ) : <ScrollPosts data={data} fetchMore={fetchMore} order_by={filter} setFilter={setFilter} refetch={refetch} />}
        </>
    )
}

export default Feed