import Graph from "graphology";
import { GET_FOLLOWERS_BY_USER_ID, GET_FOLLOWINGS_BY_USER_ID } from "../graphql/queries"
import { useQuery } from "@apollo/client"
import { useEffect, useState } from "react";
import { useLoadGraph } from "@react-sigma/core";

export const LoadGraph = ({ id, username }) => {

    const { data: followers } = useQuery(GET_FOLLOWERS_BY_USER_ID, {
        variables: {
            id: id
        }
    })

    const { data: following } = useQuery(GET_FOLLOWINGS_BY_USER_ID, {
        variables: {
            id: id
        }
    })

    const loadGraph = useLoadGraph();
    useEffect(() => {
        const graph = new Graph();
        graph.addNode(username, { x: Math.random(), y: Math.random(), size: 15, label: username, color: "blue" });

        followers?.getFollowersByUser_id?.map(follow => {
            graph.addNode(follow?.follower?.username || follow?.follower?.reddit_username, { x: Math.random(), y: Math.random(), size: 5, label: follow?.follower?.username || follow?.follower?.reddit_username, color: "green" });
            graph.addEdge(follow?.follower?.username || follow?.follower?.reddit_username, username)
        })

        following?.getFollowingsByUser_id?.map((follow) => {
            graph.addNode(follow?.following?.username || follow?.following?.reddit_username, { x: Math.random(), y: Math.random(), size: 5, label: follow?.following?.reddit_username, color: "red" })
            graph.addEdge(username, follow?.following?.reddit_username)
        })

        loadGraph(graph);
    }, [loadGraph, followers, following]);

    return loadGraph;
};

export default LoadGraph;