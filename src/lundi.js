import program from "commander";

import init from "./init";
import { directoryExists, readJSONSync } from "./files";
import { restoreAllRepos } from "./restore";
import { log, error, title } from "./log";

const pkg = require("../package.json");

process.on("unhandledRejection", (reason, p) => {
  error(`Possibly Unhandled Rejection at: Promise ${p} reason ${reason}`);
});

const configFilename = pkg.config.filename;

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
