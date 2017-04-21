const files = require('./files');
const presentation = require('./presentation');
const debug = require('debug')('init');
const path = require('path');
const git = require('./git');

// all the code related to the generation of the config files
const configFilename = require('../package').config.filename;

/**
 * Determin if directory has a .git repository
 * @param {String} directory
 */
const hasDotGit = directory => files.directoryExists(path.join(directory, '.git'));

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
  return git.getRemotes(directory)
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
    },
    error => {
      debug('error %s', error);
      return null;
    });
};

const configurationBuilder = currentDirectory => {
  presentation.log(`Trying to build config for ${currentDirectory}`);

  if (files.fileExists(configFilename)) {
    presentation.error(`Configuration file "${configFilename}" exists. Delete it to recreate.`);
    process.exit(1);
  }


  const gitDirectories = files.getDirectoriesIn(currentDirectory).filter(hasDotGit);
  const configs = { repos: [] };

  return Promise.all(gitDirectories.map(buildConfigForRepoIn))
    .then(results => {
      configs.repos = results.filter(config => !!config);
      return files.writeJSON(configFilename, configs);
    });
};

export default configurationBuilder;