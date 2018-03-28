import Debug from "debug";
import git from "simple-git/promise";
import pluralise from "pluralise";

const debug = Debug("git");

// const thereIs = (count, singular, plural) => {
//   return pluralise.withCount(
//     count,
//     `There is % ${singular}`,
//     `There are % ${plural}`
//   );
// };

export const getPendingOperations = async directory => {
  debug("hasNoPendingOperations in %s", directory);

  let response = [];

  const currentGit = git(directory);

  const issues = await currentGit.status();

  const typeOfIssues = [
    "not_added",
    "modified",
    "conflicted",
    "created",
    "deleted",
    "renamed"
  ].filter(type => issues[type] && issues[type].length);

  debug(directory, "issues %", typeOfIssues);

  response = response.concat(
    typeOfIssues.map(type => `${issues[type].length} ${type}`)
  );

  const unPushedCommits = await currentGit.log([
    "--branches",
    "--not",
    "--remotes"
  ]);

  debug(directory, "unpushed %", unPushedCommits);

  if (unPushedCommits && unPushedCommits.all && unPushedCommits.all.length) {
    response.push(
      pluralise(
        unPushedCommits.all.length,
        "an unpushed commit",
        "% unpushed commits"
      )
    );
  }

  const stashes = await currentGit.stashList();

  debug(directory, "stashed %", stashes);

  if (stashes && stashes.all && stashes.all.length) {
    response.push(pluralise(stashes.all.length, "stash", "stashes"));
  }

  debug(directory, "getPendingOperations response", response);

  return response.join(" | ");
};

export const init = directory => git(directory).init();

export const status = directory => git(directory).status();

export const fetchAll = directory => git(directory).fetch(["--all", "-p"]);

export const checkout = (directory, branch, origin) => {
  debug("Checking out %s in %s", branch, directory);
  return git(directory).checkoutBranch(branch, origin);
};

export const addRemote = (directory, name, url) => {
  debug("Adding remote %s (%s) in %s", name, url, directory);
  return git(directory).addRemote(name, url);
};

export const getRemotes = directory => git(directory).getRemotes(true);
