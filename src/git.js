import Debug from "debug";
import git from "simple-git/promise";

const debug = Debug("git");

export const hasNoPendingOperations = directory => {
  debug("hasNoPendingOperations in %s", directory);

  const currentGit = git(directory);

  return Promise.all([
    // current workspace
    currentGit.status().then(data => {
      const issues = [
        "not_added",
        "modified",
        "conflicted",
        "created",
        "deleted",
        "renamed"
      ].filter(key => data[key] && data[key].length);

      if (issues.length) {
        return Promise.reject(
          new Error(
            issues
              .map(
                issue => `${data[issue].length} ${issue} files in ${directory}`
              )
              .join("\n")
          )
        );
      }

      return Promise.resolve();
    }),

    // other branches
    currentGit.log(["--branches", "--not", "--remotes"]).then(data => {
      if (data && data.all && data.all.length) {
        return Promise.reject(`There are ${data.all.length} unpushed commits.`);
      }
      return Promise.resolve();
    }),

    // remaining stashes
    currentGit.stashList().then(data => {
      if (data && data.all && data.all.length) {
        return Promise.reject(`There are ${data.all.length} stashes.`);
      }
    })
  ]);
};

export const init = directory => git(directory).init();

export const status = directory => git(directory).status();

export const fetchAll = directory =>
  git(directory)
    .fetch(["--all", "-p"])
    .then(result => {
      debug("fetch", result);
    });

export const checkout = (directory, branch, origin) => {
  debug("Checking out %s in %s", branch, directory);
  const currentGit = git(directory);
  return currentGit.checkoutBranch(branch, origin);
};

export const addRemote = (directory, name, url) => {
  debug("Adding remote %s (%s) in %s", name, url, directory);
  const currentGit = git(directory);
  return currentGit.addRemote(name, url);
};

export const getRemotes = directory => git(directory).getRemotes(true);
