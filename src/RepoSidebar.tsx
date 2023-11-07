import { observer } from "mobx-react-lite";
import { globalState } from "./GlobalState";
import { BiGitPullRequest } from "react-icons/bi";

export default observer(({ data }: { data: any }) => {
  return (
    <div className="h-screen overflow-y-scroll bg-bg2 flex-shrink-0 border-0 border-r border-solid border-white border-opacity-10 flex flex-col ">
      <h1 className="text-base ml-5 font-bold tracking-widest opacity-50">
        ONE PLACE
      </h1>
      {data.user.repositories.nodes.map((repo: any) => (
        <button
          className={`px-5 py-3 font-medium rounded-none w-full flex items-start ${
            globalState.repo?.id == repo.id ? "bg-primary" : "bg-transparent"
          }`}
          onClick={() => globalState.setRepo(repo)}
          key={repo.id}
        >
          <img
            src={repo.owner.avatarUrl}
            className="rounded-full w-4 h-4 mr-2"
          />
          <BiGitPullRequest className="mr-2" />
          {repo.name}{" "}
          <span className="opacity-60 pl-5 ml-auto">
            {repo.pullRequests.nodes.length}
          </span>
        </button>
      ))}
    </div>
  );
});
