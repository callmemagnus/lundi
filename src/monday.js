import program from 'commander';
import async from 'async';
import path from 'path';
import { exec } from 'child_process';
import Debug from 'debug';

import files from './files';
import git from './git';
import init from './init';
import presentation from './presentation';

const pkg = require('../package.json');
const debug = Debug('main');

process.on('unhandledRejection', (reason, p) => {
  presentation.error(`Possibly Unhandled Rejection at: Promise ${p} reason ${reason}`);
});

const configFilename = pkg.config.filename;

const execFunction = (command, pathToDir) => callback => {
  const rootPath = files.currentDirectory();
  exec(
    command,
    { cwd: path.join(rootPath, pathToDir) },
    (error, stdout, stderr) => {
      if (error) {
        callback(`${error} ${stderr}`);
        return;
      }
      callback(null, 'OK');
    }
  );
};

const propagateFailure = error => {
  debug(error.message ? error.message : error);
  return Promise.reject(error);
};

if (files.directoryExists('.git')) {
  presentation.error('Inside a git directory, exiting');
  process.exit();
}

program
  .version(pkg.version)
  // .description(pkg.description)
  .option('-i, --init', 'Generate file based on current directory')
  .parse(process.argv);

presentation.title(pkg.name);

if (program.init) {
  presentation.log('Building configuration file');
  init(process.cwd()).then(() => {
    presentation.log('Built the configuration file.');
    process.exit(0);
  });
}
else if(!files.fileExists(configFilename)) {
  presentation.error('\nNo configuration file found, try --init\n');
  process.exit(1);
}
else {
  files.readJSON(configFilename).then(config => {
    presentation.log(`Read configuration file ${configFilename}`);

    return Promise.all(config.repos.map(gitConfig => {
      presentation.log(`${gitConfig.dirname}: Setting up`);

      return (files.directoryExists(gitConfig.dirname) ? 
        git.hasNoPendingOperations(gitConfig.dirname) :
        Promise.resolve())
        .then(() => files.removeDir(gitConfig.dirname), propagateFailure)

        .then(() => files.createDir(gitConfig.dirname), propagateFailure)

        .then(() => git.init(gitConfig.dirname), propagateFailure)

        .then(() => Promise.all(
            gitConfig.gitRemotes.map(remote => git.addRemote(gitConfig.dirname, remote.name, remote.refs.fetch))
        ), propagateFailure)
        
        .then(() => git.fetchAll(gitConfig.dirname), propagateFailure)

        .then(() => git.checkout(gitConfig.dirname, gitConfig.branch), propagateFailure)
        
        .then(() => {
          
          return new Promise(function(resolve, reject) {
            async.series(
              gitConfig.commands.map(
                command => execFunction(command, gitConfig.dirname)
              ),
              (error, results) => {
                if (error) {
                  reject(error);
                  return;
                }
                resolve(results);
              }
            );
          });
        }, propagateFailure)

        .catch(error => {
          presentation.error(`${gitConfig.dirname}: ${error.message ? error.message : error}`);
          return Promise.reject('broken');
        });
    }))
    .then(() => {
      presentation.log('\nEnvironment is ready!\n');
    }, () => presentation.error('Something went wrong! See previous errors.'));
  });
}
