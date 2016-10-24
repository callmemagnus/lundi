const chalk = require('chalk');
const figlet = require('figlet');

module.exports = {
  title: (text) => {
    console.log(
      chalk.white(
        figlet.textSync(text, { horizontalLayout: 'full' })
      )
    );
  },
  error: (text) => {
    console.log(
      chalk.red(
        `\n${text}\n`
      )
    );
  },
  log: function() {
    console.log.apply(console, arguments);
  }
};
