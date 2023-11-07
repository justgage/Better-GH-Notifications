import { gql } from "@apollo/client";

export const GET_REPOS_PRS = gql`
  {
    user: viewer {
      repositories(first: 10, orderBy: { field: UPDATED_AT, direction: DESC }) {
        nodes {
          id
          name
          url
          owner {
            avatarUrl
            login
          }

          pullRequests(last: 10) {
            nodes {
              id
              author {
                avatarUrl
                login
              }
              isDraft
              title
              bodyHTML
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
                  createdAt
                }
              }
            }
          }
        }
      }
    }
  }
`;
