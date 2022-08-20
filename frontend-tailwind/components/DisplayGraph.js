import dynamic from 'next/dynamic'
import "@react-sigma/core/lib/react-sigma.min.css";
import { MultiDirectedGraph } from "graphology";

export const DisplayGraph = ({ id, username }) => {
  const isBrowser = () => typeof window !== "undefined"
  if (isBrowser) {
    const SigmaContainer = dynamic(
      import("@react-sigma/core").then((mod) => mod.SigmaContainer),
      { ssr: false },
    );
    const LoadGraph = dynamic(
      import("./LoadGraph"),
      { ssr: false },
    );
    return (
      <div className="h-4/5 mt-5 w-full">
        <SigmaContainer graph={MultiDirectedGraph}>
          <LoadGraph id={id} username={username} />
        </SigmaContainer>
      </div>
    );
  } else return <p>NOT AVAILABLE</p>;

};

export default DisplayGraph