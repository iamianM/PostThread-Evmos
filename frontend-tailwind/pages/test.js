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

};

export default DisplayGraph