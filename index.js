#!/usr/bin/env node --harmony

'use strict';
const program = require('commander');
const debug = require('debug')('monday');
const async = require('async');
const path = require('path');
const exec = require('child_process').exec;


const files = require('./libs/files');
const git = require('./libs/git');
const presentation = require('./libs/presentation');
const init = require('./libs/init');
const pkg = require('./package.json');

const configFilename = pkg.config.filename;

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

    Promise.all(config.repos.map(gitConfig => {
      presentation.log(`${gitConfig.dirname}: Setting up`);

      return new Promise(function(resolve, reject) {
        if (files.directoryExists(gitConfig.dirname)) {
          git.hasNoPendingOperations(gitConfig.dirname)
            .then(() => {
              presentation.log(`${gitConfig.dirname}: Deleting`);
              return files.removeDir(gitConfig.dirname);
            })
            .then(() => resolve)
            .catch(() => reject);
        }
        else {
          resolve();
        }
      })
        .then(() => {
          presentation.log(`${gitConfig.dirname}: Creating`);
          return files.createDir(gitConfig.dirname);
        })
        .then(() => {
          return git.init(gitConfig.dirname);
        })
        .then(() => {
          presentation.log(`${gitConfig.dirname}: Add remotes`);
          return Promise.all(
            gitConfig.gitRemotes.map(remote => git.addRemote(gitConfig.dirname, remote.name, remote.refs.fetch))
          );
        })
        .then(() => {
          presentation.log(`${gitConfig.dirname}: Fetching all`);
          return git.fetchAll(gitConfig.dirname);
        })
        .then(() => {
          presentation.log(`${gitConfig.dirname}: Checking out ${gitConfig.branch}`);
          return git.checkout(gitConfig.dirname, gitConfig.branch);
        })
        .then(() => {
          presentation.log(`${gitConfig.dirname}: Running configured commands`);
          const rootPath = files.currentDirectory();
          const execFunction = command => callback => {
            exec(
              command,
              { cwd: path.join(rootPath, gitConfig.dirname) },
              (error, stdout, stderr) => {
                if (error) {
                  callback(error + ' ' + stderr);
                  return;
                }
                callback(null, 'OK');
              }
            );
          };

          return new Promise(function(resolve, reject) {
            async.series(
              gitConfig.commands.map(command => {
                return execFunction(command);
              }),
              (error, results) => {
                if (error) {
                  reject(error);
                  return;
                }
                resolve(results);
              }
            );
          });
        })
        .catch((error) => {
          presentation.error(`${gitConfig.dirname}: ${error}`);
          return Promise.reject(gitConfig.dirname);
        });
    }))
    .then(() => {
      presentation.log(`\nEnvironment is ready!\n`);
    });
  });
}
