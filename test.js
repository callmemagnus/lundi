const init = require('./libs/init');
const git = require('./libs/git');

console.log(process.cwd());
//
// git.hasNoPendingOperations(process.cwd())
//   .then(() => {
//     console.log();
//   })
//   .catch((error) => {
//     console.log(error);
//   })
// init(process.cwd());
//
git.hasNoPendingOperations(process.cwd());
