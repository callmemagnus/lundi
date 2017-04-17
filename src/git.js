import Debug from 'debug';
import git from 'simple-git';
import promisify from './promisify';

const debug = Debug('git');

const logAndPreparePromiseToRun = command => directory => {
  debug(`${command} on ${directory}`);
  const currentGit = git(directory);
  return promisify(currentGit[command], currentGit);
};


export const hasNoPendingOperations = directory => {
  debug('hasNoPendingOperations in %s', directory);
  
  const currentGit = git(directory);

  return Promise.all([
    // current workspace
    promisify(currentGit.status, currentGit)().then(data => {
      const issues = [
        'not_added',
        'modified',
        'conflicted',
        'created',
        'deleted',
        'renamed',
      ].filter(key => data[key] && data[key].length);

      if (issues.length) {
        return Promise.reject(new Error(issues.map(issue => `${data[issue].length} ${issue} files in ${directory}`).join('\n')));
      }

      return Promise.resolve();
    }),

    // other branches
    promisify(currentGit.log, currentGit)(['--branches', '--not', '--remotes']).then((data) => {
      if (data && data.all && data.all.length) {
        return Promise.reject(`There are ${data.all.length} unpushed commits.`);
      }
      return Promise.resolve();
    }),

    // remaining stashes
    promisify(currentGit.stashList, currentGit)().then((data) => {
      if (data && data.all && data.all.length) {
        return Promise.reject(`There are ${data.all.length} stashes.`);
      }
    })
  ]);
};

export const init = directory => logAndPreparePromiseToRun('init')(directory)();

export const fetchAll = directory => 
  logAndPreparePromiseToRun('fetch')(directory)(['--all', '-p'])
    .then(result => {
      debug('fetch', result);
    });

export const checkout = (directory, branch) => {
  debug('Checking out %s in %s', branch, directory);
  const currentGit = git(directory);
  return promisify(currentGit.checkout, currentGit)(branch);
};

export const addRemote = (directory, name, url) => {
  debug('Adding remote %s (%s) in %s', name, url, directory);
  const currentGit = git(directory);
  return promisify(currentGit.addRemote, currentGit)(name, url);
};

export const getRemotes = directory => 
  logAndPreparePromiseToRun('getRemotes')(directory)(true);

// {
//   debug('getRemotes in %s', directory);
//   const currentGit = git(directory);
//   return promisify(currentGit.getRemotes, currentGit)(/* verbose */true);
//   // data is an array e.g.:
//   /*
//   [
//     {
//       name: 'mine',
//       refs: {
//         fetch: 'ssh://git@stash.nespresso.com:7999/~nnandersma/ecom-api-clients.git',
//         push: 'ssh://git@stash.nespresso.com:7999/~nnandersma/ecom-api-clients.git'
//       }
//     }, {
//       name: 'origin',
//       refs: {
//         fetch: 'ssh://git@stash.nespresso.com:7999/ecapi/ecom-api-clients.git',
//         push: 'ssh://git@stash.nespresso.com:7999/ecapi/ecom-api-clients.git'
//       }
//     }
//   ]
//   */
// };


export default {
  addRemote,
  checkout,
  // clone,
  fetchAll,
  getRemotes,
  hasNoPendingOperations,
  init,
};
