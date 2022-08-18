import { GET_FOLLOWERS_BY_USER_ID, GET_FOLLOWINGS_BY_USER_ID } from "../graphql/queries"
import { useQuery } from "@apollo/client"
import { useEffect } from "react";
import dynamic from 'next/dynamic'
import "@react-sigma/core/lib/react-sigma.min.css";

export const DisplayGraph = () => {
    const isBrowser = () => typeof window !== "undefined"
    if (isBrowser) {
    const SigmaContainer = dynamic(
        import("@react-sigma/core").then((mod) => mod.SigmaContainer),
        { ssr: false },
    );
    const LoadGraph = dynamic(
        import("../components/LoadGraph"),
        { ssr: false },
    );
  return (
    <div className="h-screen w-full">
        <SigmaContainer  >
        <LoadGraph />
        </SigmaContainer>
    </div>
  );
} else return <p>NOT AVAILABLE</p>;

//   return (
    
//     <SigmaContainer className="w-full h-screen">
//       <LoadGraph />
//     </SigmaContainer>
//   );
};

export default DisplayGraph

// function test() {


//     const graph = new Graph();

//     graph.addNode("John", { x: 0, y: 10, size: 5, label: "John", color: "blue" });
//     graph.addNode("Mary", { x: 10, y: 0, size: 3, label: "Mary", color: "red" });

//     graph.addEdge("John", "Mary");

//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     const renderer = new Sigma(graph, container);

//     const { data: followers } = useQuery(GET_FOLLOWERS_BY_USER_ID, {
//         variables: {
//             id: "318"
//         }
//     })

//     const { data: following } = useQuery(GET_FOLLOWINGS_BY_USER_ID, {
//         variables: {
//             id: "318"
//         }
//     })

//     console.log(followers)
//     console.log(following)

//     return (
        
//             {/* {
//                 followers?.getFollowersByUser_id?.map(follow => (
//                     <div key={follow?.id}>
//                         {follow?.follower.username} is following 318
//                     </div>))
//             }
//             {
//                 following?.getFollowingsByUser_id?.map(follow => (
//                     <div key={follow?.id}>
//                         318 is following {follow?.following.username}
//                     </div>))
//             } */}
//     )
// }

// export default test