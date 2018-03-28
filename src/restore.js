import Debug from "debug";
import {
  directoryExists,
  removeDir,
  createDir,
  currentDirectory
} from "./files";
import { log, error } from "./log";
import {
  hasNoPendingOperations,
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

export const runCommand = () => {};

export const restoreRepo = async repoConfiguration => {
  const { directory, remotes, commands } = repoConfiguration;
  log(`Restoring ${directory}`);

  if (!directoryExists(directory)) {
    log(`Directory in configfile ${directory} does not exist.`);
    throw new Error("Directory does not exist");
  }

  try {
    await hasNoPendingOperations(directory);
    const { current, tracking } = await status(directory);
    debug(`Will restore ${current} from ${tracking}`);

    await removeDir(directory);
    debug(`${directory}: removed`);

    await createDir(directory);
    debug(`${directory}: created`);

    await init(directory);
    debug(`${directory}: init`);
    remotes.forEach(async ({ name, refs: { fetch } }) => {
      debug(`${directory}: Adding ${name} from ${fetch}`);
      await addRemote(directory, name, fetch);
    });

    await fetchAll(directory);
    debug(`${directory}: fetched`);

    if (tracking && current) {
      await checkout(directory, current, tracking);
      debug(`${directory}: ${current} checked out`);
    } else {
      await checkout(directory, "master", "origin/master");
    }

    commands.forEach(async command => {
      debug(`${directory}: executing ${command}`);
      execFunction(command, directory)(error => {
        if (error) {
          debug(`${directory}: Error in command "${command}": ${error}`);
        }
      });
    });
  } catch (e) {
    error(`${directory}: there was an error "${e.message ? e.message : e}"`);
  }
};

export const restoreAllRepos = reposConfiguration =>
  Promise.all(reposConfiguration.map(restoreRepo));
