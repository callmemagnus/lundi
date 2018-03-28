import Debug from "debug";
import async from "async";
import { removeDir, createDir, currentDirectory } from "./files";
import { error, progress } from "./log";
import {
  getPendingOperations,
  addRemote,
  init,
  fetchAll,
  checkout,
  status
} from "./git";
import { exec } from "child_process";
import path from "path";

const debug = Debug("restore");

const execFunction = (command, pathToDir) => callback => {
  const rootPath = currentDirectory();
  exec(
    command,
    { cwd: path.join(rootPath, pathToDir) },
    (error, stdout, stderr) => {
      if (error) {
        callback(`${error} ${stderr}`);
        return;
      }
      callback(null, "OK");
    }
  );
};

export const restoreRepo = async repoConfiguration => {
  const { directory, remotes, commands } = repoConfiguration;
  progress(0, directory, "starting to restore");

  const pending = await getPendingOperations(directory);

  if (pending) {
    debug(`${directory}: ${pending}`);
    progress(0, directory, pending);
    return Promise.resolve(false);
  }

  try {
    const { current, tracking } = await status(directory);
    debug(`Will restore ${current} from ${tracking}`);
    progress(1, directory, `Will restore ${current} from ${tracking}`);

    await removeDir(directory);
    debug(`${directory}: removed`);
    progress(2, directory, "Removed");

    await createDir(directory);
    debug(`${directory}: created`);
    progress(3, directory, "Created");

    await init(directory);
    debug(`${directory}: init`);
    progress(4, directory, "Initialized");

    remotes.forEach(async ({ name, refs: { fetch } }) => {
      debug(`${directory}: Adding ${name} from ${fetch}`);
      await addRemote(directory, name, fetch);
      progress(5, directory, `Added ${name} remote`);
    });

    await fetchAll(directory);
    debug(`${directory}: fetched`);
    progress(6, directory, "Fetched");

    if (tracking && current) {
      await checkout(directory, current, tracking);
      debug(`${directory}: ${current} checked out`);
      progress(7, directory, `Checked out ${current}`);
    } else {
      await checkout(directory, "master", "origin/master");
    }

    debug(`${directory}: is restored.`);
    progress(8, directory, "Restored.");
    async.series(
      commands.filter(x => !!x).map(command => {
        debug(`${directory}: executing "${command}"`);
        progress(10, directory, `Running "${command}"`);
        return execFunction(command, directory);
      }),
      error => {
        if (error) {
          debug(`${directory}: error executing commands: "${error}"`);
          throw new Error(error);
        }
        progress(11, directory, "Commands executed.");
      }
    );
    return true;
  } catch (e) {
    error(`${directory}: there was an error "${e.message ? e.message : e}"`);
  }
};

export const restoreAllRepos = reposConfiguration =>
  reposConfiguration.forEach(async configuration => {
    const result = await restoreRepo(configuration);
    if (result && !configuration.commands.length) {
      progress(12, configuration.directory, "Done.");
    }
  });
