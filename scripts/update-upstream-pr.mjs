import { command, updatePullRequests } from "./upstream/pull-requests.mjs";

const id = `${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT}`;
if (!/^\d+-\d+$/.test(id))
  throw new Error("Run this publisher from GitHub Actions.");
console.log(updatePullRequests(command, id));
