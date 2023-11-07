import { setContext } from "@apollo/client/link/context";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { globalState } from "./GlobalState";

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

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
