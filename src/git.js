import Debug from "debug";
import git from "simple-git/promise";
import pluralise from "pluralise";

const debug = Debug("git");

const thereIs = (count, singular, plural) => {
  return pluralise.withCount(
    count,
    `There is % ${singular}`,
    `There are % ${plural}`
  );
};

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
                issue =>
                  thereIs(
                    data[issue].length,
                    `${issue} file`,
                    `${issue} files`
                  ) + ` in ${directory}`
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
        throw new Error(
          `${directory}: ${thereIs(
            data.all.length,
            "unpushed commit",
            "unpushed commits"
          )}`
        );
      }
      return Promise.resolve();
    }),

    // remaining stashes
    currentGit.stashList().then(data => {
      if (data && data.all && data.all.length) {
        throw new Error(
          `${directory}: ${thereIs(data.all.length, "stash", "stashes")}.`
        );
      }
    })
  ]);
};

export const init = directory => git(directory).init();

export const status = directory => git(directory).status();

export const fetchAll = directory => git(directory).fetch(["--all", "-p"]);

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
