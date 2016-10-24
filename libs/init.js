const files = require('./files');
const presentation = require('./presentation');
const debug = require('debug')('init');
const path = require('path');
const git = require('./git');

// all the code related to the generation of the config files
const configFilename = require('../package').config.filename;

const hasDotGit = directory => {
  return files.directoryExists(path.join(directory, '.git'));
};

const findCommandForproject = directory => {
  if (files.fileExists(path.join(directory, 'package.json'))) {
    // return {
    //   command: 'npm',
    //   args: [
    //     'install',
    //     '--cache-min 999999' // let's leverage the cache
    //   ]
    // };
    return 'npm install --cache-min 99999';
  }
  else if (files.fileExists(path.join(directory, 'pom.xml'))) {
    // return {
    //   command: 'mvn',
    //   args: [
    //     'compile'
    //   ]
    // };
    return 'mvn compile';
  }

  return '';
};

const buildConfigForRepoIn = directory => {
  debug('buildConfigForRepoIn %s', directory);
  return git.getRemotes(path.join(files.currentDirectory(), directory))
    .then(data => {
      debug('configuration for %s (%d remotes)', directory, data.length);

      const dataEmptyRemoved = data.filter(item => !!item.name.length);

      if (!dataEmptyRemoved.length) {
        return Promise.reject('No remotes');
      }

      const config = {
        dirname: directory,
        gitRemotes: data,
        branch: 'master'
      };

      config.commands = [];

      const command = findCommandForproject(directory);

      if (command && command.length) {
        config.commands.push(command);
      }

      return config;
    })
    .catch(error => {
      debug('error %s', error);
      return null;
    });

  // return new Promise((resolve, reject) => {
  //   const config = {};
  //   simpleGit(directory)
  //     .getRemotes(/* verbose */true  , (error, data) => {
  //       debug(`git repos in ${directory}`);
  //
  //       if (error) {
  //         reject(error);
  //       }
  //
  //       // data is an array e.g.:
  //       /*
  //       [
  //         {
  //           name: 'mine',
  //           refs: {
  //             fetch: 'ssh://git@stash.nespresso.com:7999/~nnandersma/ecom-api-clients.git',
  //             push: 'ssh://git@stash.nespresso.com:7999/~nnandersma/ecom-api-clients.git'
  //           }
  //         }, {
  //           name: 'origin',
  //           refs: {
  //             fetch: 'ssh://git@stash.nespresso.com:7999/ecapi/ecom-api-clients.git',
  //             push: 'ssh://git@stash.nespresso.com:7999/ecapi/ecom-api-clients.git'
  //           }
  //         }
  //       ]
  //       */
  //
  //       config.repos = data;
  //
  //       debug(data);
  //     });
  // });

};

module.exports = function(currentDirectory) {
  presentation.log(`Trying to build config for ${currentDirectory}`);

  if (files.fileExists(configFilename)) {
    presentation.error(`Configuration file "${configFilename}" exists. Delete it to recreate.`);
    process.exit(1);
  }

  return new Promise((resolve, reject) => {
    const configs = {
      repos: []
    };

    const gitDirectories = files.getDirectoriesIn(currentDirectory).filter(hasDotGit);

    Promise.all(gitDirectories.map(buildConfigForRepoIn))
      .then((results) => {
        configs.repos = results.filter(config => !!config);

        return files.writeJSON(configFilename, configs)
          .then(resolve, reject);
      })
      .catch(() => reject);
  });
};
