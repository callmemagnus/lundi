import { log, error } from "./log";
import Debug from "debug";
import path from "path";
import {
  directoryExists,
  fileExists,
  writeJSON,
  getDirectoriesIn
} from "./files";
import { getRemotes, status } from "./git";
import { inspect } from "util";

const debug = Debug("init");

// all the code related to the generation of the config files
const configFilename = require("../package").config.filename;

/**
 * Determin if directory has a .git repository
 * @param {String} directory
 */
const hasDotGit = directory => directoryExists(path.join(directory, ".git"));

const findCommandForproject = directory => {
  if (fileExists(path.join(directory, "package.json"))) {
    return "npm install --cache-min 99999";
  } else if (fileExists(path.join(directory, "pom.xml"))) {
    return "mvn compile";
  }

  return null;
};

const buildConfigForRepoIn = async directory => {
  debug("buildConfigForRepoIn %s", directory);
  try {
    const remotes = await getRemotes(directory);

    const command = findCommandForproject(directory);

    const commands = command ? [command] : [];

    return {
      directory,
      remotes,
      commands
    };
  } catch (e) {
    throw e;
  }
};

const configurationBuilder = currentDirectory => {
  log(`Trying to build config for ${currentDirectory}`);

  if (fileExists(configFilename)) {
    error(
      `Configuration file "${configFilename}" exists. Delete it to recreate.`
    );
    process.exit(1);
  }

  const gitDirectories = getDirectoriesIn(currentDirectory).filter(hasDotGit);
  const configs = { repos: [] };

  return Promise.all(gitDirectories.map(buildConfigForRepoIn)).then(results => {
    configs.repos = results.filter(config => !!config);
    return writeJSON(configFilename, configs);
  });
};

export default configurationBuilder;
