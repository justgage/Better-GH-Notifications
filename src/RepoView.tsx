import { observer } from "mobx-react-lite";
import { useState } from "react";
import en from "javascript-time-ago/locale/en.json";
import Markdown from "react-markdown";
import ReactTimeAgo from "react-time-ago";
import TimeAgo from "javascript-time-ago";
import { DynamicHeightContainer } from "@/DynamicHeightParent";

TimeAgo.addDefaultLocale(en);

export const RepoView = observer(({ repo }: any) => {
  const [selectedPR, setSelectedPR] = useState(null);

  const sortedPRs = repo.pullRequests.nodes
    .slice()
    .sort(
      (a: any, b: any) => a.isDraft - b.isDraft || b.createdAt - a.createdAt
    );

  return (
    <div className="overflow-y-auto flex-grow bg-bg">
      {sortedPRs.map((pr: any) => (
        <div
          key={pr.id}
          className={`text-left ${pr.isDraft ? "opacity-50" : ""}`}
        >
          <button
            className="w-full text-left bg-transparent"
            onClick={() => {
              if (selectedPR === pr) {
                setSelectedPR(null);
              } else {
                setSelectedPR(pr);
              }
            }}
          >
            <img
              src={pr.author.avatarUrl}
              className="w-8 h-8 float-left rounded-full mr-2"
            />
            <h2 className="text-sm pt-1 my-0">{pr.title}</h2>
            <div className="ml-10 flex gap-2 opacity-60">
              <ReactTimeAgo date={pr.createdAt} locale="en-US" />
              <span className="text-green-500"> +{pr.additions}</span>{" "}
              <span className="text-red-500"> -{pr.deletions}</span>
              {`${pr.comments.nodes.length} comment${
                pr.comments.nodes.length === 1 ? "" : "s"
              }`}
            </div>
          </button>

          <div>
            {selectedPR === pr ? (
              <div className="border-0 border-l-2 pl-5 border-solid border-primary">
                <div
                  className="opacity-80 rounded-lg p-2"
                  dangerouslySetInnerHTML={{ __html: pr.bodyHTML }}
                ></div>
                {pr.comments.nodes.map((comment: any) => (
                  <p
                    key={comment.id}
                    className="text-left mt-2 text-gray-300 bg-slate-900 rounded-lg p-2"
                  >
                    <div className="flex items-center">
                      <img
                        src={comment.author.avatarUrl}
                        className="w-9 h-9 rounded-full mr-2"
                      />
                      <div>
                        <h3 className="my-0 py-9-0">{comment.author.login}</h3>
                        <ReactTimeAgo date={comment.createdAt} locale="en-US" />
                      </div>
                    </div>
                    <Markdown>{comment.body}</Markdown>
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
});
