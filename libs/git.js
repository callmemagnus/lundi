const git = require('simple-git');
const debug = require('debug')('git');
const promisify = require('./promisify');

const hasNoPendingOperations = directory => {
  debug('hasNoPendingOperations in %s', directory);
  const currentGit = git(directory);

  return Promise.all([
    // current workspace
    promisify(currentGit.status, currentGit)().then((data) => {
      [
        'not_added',
        'modified',
        'conflicted',
        'created',
        'deleted',
        'renamed',
      ].forEach(key => {
        if (data[key] && data[key].length) {
          return Promise.reject(`There are ${data[key].length} ${key} files in ${directory}`);
        }
      });
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

const init = directory => {
  debug('Init in %s', directory);
  const currentGit = git(directory);
  return promisify(currentGit.init, currentGit)();
};

const fetchAll = directory => {
  debug('Fetching in %s', directory);
  const currentGit = git(directory);
  const fetch = promisify(currentGit.fetch, currentGit);

  return fetch([
    '--all',
    '-p'
  ])
  .then(result => {
    debug('fetch', result);
  });
};

const checkout = (directory, branch) => {
  debug('Checking out %s in %s', branch, directory);
  const currentGit = git(directory);
  return promisify(currentGit.checkout, currentGit)(branch);
};

const addRemote = (directory, name, url) => {
  debug('Adding remote %s (%s) in %s', name, url, directory);
  const currentGit = git(directory);
  return promisify(currentGit.addRemote, currentGit)(name, url);
};

const getRemotes = directory => {
  debug('getRemotes in %s', directory);
  const currentGit = git(directory);
  return promisify(currentGit.getRemotes, currentGit)(/* verbose */true);
  // data is an array e.g.:
  /*
  [
    {
      name: 'mine',
      refs: {
        fetch: 'ssh://git@stash.nespresso.com:7999/~nnandersma/ecom-api-clients.git',
        push: 'ssh://git@stash.nespresso.com:7999/~nnandersma/ecom-api-clients.git'
      }
    }, {
      name: 'origin',
      refs: {
        fetch: 'ssh://git@stash.nespresso.com:7999/ecapi/ecom-api-clients.git',
        push: 'ssh://git@stash.nespresso.com:7999/ecapi/ecom-api-clients.git'
      }
    }
  ]
  */
};


module.exports = {
  addRemote,
  checkout,
  // clone,
  fetchAll,
  getRemotes,
  hasNoPendingOperations,
  init,
};
