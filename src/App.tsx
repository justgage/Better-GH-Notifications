import { observer } from "mobx-react-lite";
import "./App.css";

import { ApolloProvider, useQuery } from "@apollo/client";
import RepoSidebar from "./RepoSidebar";
import { RepoView } from "./RepoView";
import { client } from "./client";
import { globalState } from "./GlobalState";
import { GET_REPOS_PRS } from "@/GET_REPOS_PRS";

console.log(
  "[App.tsx]",
  `Hello world from Electron ${process.versions.electron}!`
);

const App = observer(() => {
  const { loading, error, data } = useQuery(GET_REPOS_PRS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  const { repo } = globalState;
  return (
    <div className="bg-bg flex justify-stretch h-screen w-screen">
      <RepoSidebar data={data} />
      {repo ? (
        <RepoView repo={repo} />
      ) : (
        <RepoView
          repo={{
            pullRequests: {
              nodes: data.user.repositories.nodes.flatMap(
                (repo: any) => repo.pullRequests.nodes
              ),
            },
          }}
        />
      )}
    </div>
  );
});

const Root = observer(() => {
  const { apiKey, apiKeyValid, repo } = globalState;
  return apiKey && apiKeyValid ? (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  ) : (
    <div className="App flex flex-col justify-stretch">
      <h1>Github Notifs</h1>
      <p>Please enter your Github API key</p>
      <input
        type="text"
        className="border-2 border-gray-500 p-3 my-5 border-solid rounded-lg"
        onChange={(e) => globalState.setApiKey(e.target.value)}
      />
      <button onClick={() => globalState.validate()}>Submit</button>
    </div>
  );
});

export default Root;
