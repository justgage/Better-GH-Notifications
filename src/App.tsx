import { useState } from "react";
import { observer } from "mobx-react-lite";
import UpdateElectron from "@/components/update";
import "./App.css";
import { setContext } from "@apollo/client/link/context";

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
  useQuery,
  HttpLink,
} from "@apollo/client";
import { action, makeAutoObservable } from "mobx";
import Markdown from "react-markdown";
import { DynamicHeightContainer } from "@/DynamicHeightParent";

class GlobalState {
  constructor(
    public apiKey: string,
    public apiKeyValid: boolean,
    public notifs: any,
    private error = "",
    public repo: any = null
  ) {
    this.apiKey = localStorage.getItem("apiKey") || "";
    if (this.apiKey !== "") {
      this.validate();
    }
    makeAutoObservable(
      this,
      {
        setApiKey: action,
        setRepo: action,
        validate: action,
      },
      { autoBind: true }
    );
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem("apiKey", apiKey);
  }

  setRepo(repo: any) {
    this.repo = repo;
  }

  private setApiKeyValid(apiKeyValid: boolean) {
    this.apiKeyValid = apiKeyValid;
  }

  validate() {
    client
      .query({
        query: gql`
          {
            viewer {
              login
            }
          }
        `,
      })
      .then((res) => {
        console.log(res);
        this.setApiKeyValid(true);
      })
      .catch((err) => {
        console.error(err);
        this.error = err.message;
        this.setApiKeyValid(false);
      });
  }
}

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = globalState.apiKey; // replace this with the actual way you retrieve the API key
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const httpLink = new HttpLink({ uri: "https://api.github.com/graphql" });

const client = new ApolloClient({
  link: authLink.concat(httpLink), // httpLink is your actual link
  cache: new InMemoryCache(),
});

const globalState = new GlobalState("", false, []);
window.globalState = globalState;

console.log(
  "[App.tsx]",
  `Hello world from Electron ${process.versions.electron}!`
);

const App = observer(() => {
  const { apiKey, apiKeyValid, repo } = globalState;
  return apiKey && apiKeyValid ? (
    <ApolloProvider client={client}>
      {repo ? (
        <RepoView repo={repo} />
      ) : (
        <div className="App">
          <h1>Github Notifs</h1>
          <DisplayNotifs />
          <UpdateElectron />
        </div>
      )}
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

const GET_REPOS_PRS = gql`
  {
    user(login: "justgage") {
      repositories(first: 3, orderBy: { field: UPDATED_AT, direction: DESC }) {
        nodes {
          id
          name
          url
          pullRequests(last: 10) {
            nodes {
              author {
                avatarUrl
                login
              }
              isDraft
              title
              createdAt
              additions
              deletions
              comments(last: 10) {
                nodes {
                  author {
                    avatarUrl
                    login
                  }
                  body
                }
              }
            }
          }
        }
      }
    }
  }
`;

const DisplayNotifs = observer(() => {
  const { loading, error, data } = useQuery(GET_REPOS_PRS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  console.log(data);

  return (
    <div>
      <h1>Notifs</h1>
      {data.user.repositories.nodes.map((repo: any) => (
        <button onClick={() => globalState.setRepo(repo)} key={repo.id}>
          <h2>{repo.name}</h2>
        </button>
      ))}
    </div>
  );
});

const RepoView = observer(({ repo }: any) => {
  const [selectedPR, setSelectedPR] = useState(null);

  const sortedPRs = repo.pullRequests.nodes
    .slice()
    .sort((a: any, b: any) => a.isDraft - b.isDraft);

  return (
    <div className="text-white bg-gray-800">
      {sortedPRs.map((pr: any) => (
        <div key={pr.id} className="text-left p-4 border-b border-gray-600">
          <img
            src={pr.author.avatarUrl}
            className="w-8 h-8 float-left rounded-full mr-2"
          />
          <h2 className="text-xl pt-1 my-0">{pr.title}</h2>
          <div className="flex gap-2">
            <p>{new Date(pr.createdAt).toLocaleDateString()}</p>
            <p>Additions: {pr.additions}</p>
            <p>Deletions: {pr.deletions}</p>
          </div>
          <div className="flex">
            <button
              className="mt-2 text-blue-500 hover:underline"
              onClick={() => {
                if (selectedPR === pr) {
                  setSelectedPR(null);
                } else {
                  setSelectedPR(pr);
                }
              }}
            >
              {selectedPR === pr
                ? "Hide"
                : `Show ${pr.comments.nodes.length} comments`}
            </button>
            {/* show avatars if we're not showing the comments */}
            {selectedPR !== pr ? (
              <div className="flex gap-2">
                {pr.comments.nodes.map((comment: any) => (
                  <img
                    key={comment.id}
                    src={comment.author.avatarUrl}
                    className="w-8 h-8 float-left rounded-full mr-2"
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="border-l-2 border-solid border-opacity-50 border-white">
            {selectedPR === pr
              ? pr.comments.nodes.map((comment: any) => (
                  <p key={comment.id} className="text-left mt-2 text-gray-300">
                    <img
                      src={comment.author.avatarUrl}
                      className="w-8 h-8 float-left rounded-full mr-2"
                    />
                    <Markdown>{comment.body}</Markdown>
                  </p>
                ))
              : []}
          </div>
        </div>
      ))}
    </div>
  );
});

export default App;
