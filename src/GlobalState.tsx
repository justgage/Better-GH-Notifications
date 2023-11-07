import { gql } from "@apollo/client";
import { action, makeAutoObservable } from "mobx";
import { client } from "./client";

export class GlobalState {
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
export const globalState = new GlobalState("", false, []);
window.globalState = globalState;
