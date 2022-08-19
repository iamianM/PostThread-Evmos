import Graph from "graphology";
import { GET_FOLLOWERS_BY_USER_ID, GET_FOLLOWINGS_BY_USER_ID } from "../graphql/queries"
import { useQuery } from "@apollo/client"
import { useEffect, useState } from "react";
import { useLoadGraph } from "@react-sigma/core";

export const LoadGraph = () => {

    const [xOffset, setXOffset] = useState(5);
    const [yOffset, setYOffset] = useState(5);

    const { data: followers } = (GET_FOLLOWERS_BY_USER_ID, {
        variables: {
            id: "318"
        }
    })

    const { data: following } = useQuery(GET_FOLLOWINGS_BY_USER_ID, {
        variables: {
            id: "318"
        }
    })

    const isBrowser = () => typeof window !== "undefined";
    if (isBrowser) {
        const loadGraph = useLoadGraph();
        useEffect(() => {
            const graph = new Graph();
            graph.addNode("John", { x: 0, y: 10, size: 5, label: "John", color: "blue" });

            followers?.getFollowersByUser_id?.map(follow => {
                graph.addNode(follow?.follower?.username, { x: 0 + xOffset, y: 10 + yOffset, size: 5, label: follow?.follower?.username, color: "green" })
                graph.addEdge(follow?.follower?.username, "John")
                setXOffset(prevXOffset => prevXOffset + 1)
                setYOffset(prevYOffset => prevYOffset + 1)
            })

            following?.getFollowingsByUser_id?.map((follow, index) => {
                graph.addNode(follow?.following?.username, { x: 10 + index, y: 10 - 5 * index, size: 5, label: follow?.following?.username, color: "red" })
                graph.addEdge("John", follow?.following?.username)
                setXOffset(prevXOffset => prevXOffset + 1)
                setYOffset(prevYOffset => prevYOffset + 1)
            })

            loadGraph(graph);
        }, [loadGraph, followers, following]);

        return loadGraph;
    } else return <p>NOT AVAILABLE</p>;
};

export default LoadGraph;