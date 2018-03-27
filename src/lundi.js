import program from "commander";
import async from "async";
import path from "path";
import { exec } from "child_process";
import Debug from "debug";

import init from "./init";
import {
  currentDirectory,
  directoryExists,
  fileExists,
  removeDir,
  createDir,
  readJSON,
  readJSONSync
} from "./files";
import { hasNoPendingOperations, addRemote, fetchAll, checkout } from "./git";
import { restoreAllRepos } from "./restore";
import { log, error, title } from "./log";

const pkg = require("../package.json");
const debug = Debug("main");

process.on("unhandledRejection", (reason, p) => {
  error(`Possibly Unhandled Rejection at: Promise ${p} reason ${reason}`);
});

const configFilename = pkg.config.filename;

const propagateFailure = error => {
  debug(error.message ? error.message : error);
  return Promise.reject(error);
};

if (directoryExists(".git")) {
  error("Inside a git directory, exiting");
  process.exit();
}

program
  .version(pkg.version)
  // .description(pkg.description)
  .option("-i, --init", "Generate file based on current directory")
  .parse(process.argv);

title(pkg.name);

async function initialize() {
  try {
    if (!program.init) {
      error("\nNo configuration file found, try --init\n");
    } else {
      log("Building configuration file");
      await init(process.cwd());
      log("Built the configuration file.");
    }

    process.exit(1);
  } catch (e) {
    error(e);
  }
}

async function restore(config) {
  try {
    log(`Read configuration file ${configFilename}`);
    await restoreAllRepos(config.repos);
  } catch (e) {
    error(e);
  }
}

try {
  const config = readJSONSync(configFilename);
  restore(config);
} catch (e) {
  if (/ENOENT/.test(e.message)) {
    initialize();
  } else {
    error(e);
  }
}
