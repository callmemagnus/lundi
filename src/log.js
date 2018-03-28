import chalk from "chalk";
import figlet from "figlet";
import updateLog from "log-update";
import pad from "pad";

/* eslint-disable no-console */

/**
 *
 * @param {String} text
 */
export const title = text =>
  console.log(chalk.white(figlet.textSync(text, { horizontalLayout: "full" })));

/**
 *
 * @param {String} text
 */
export const error = text => console.log(chalk.red(`\n${text}\n`));

/**
 *
 * @param {Array} args
 */
export const log = (...args) => console.log.apply(console, args);
/* eslint-enable no-console */

const savedLines = {};

export const progress = (progressValue, topic, message) => {
  if (process.env.DEBUG) {
    log(`${topic}: ${message}`);
  } else {
    savedLines[topic.trim] = {
      progress: progressValue,
      message
    };

    let maxLength = 0;

    updateLog(
      Object.keys(savedLines)
        .map(directory => {
          maxLength = Math.max(directory.length, maxLength);
          return directory;
        })
        .reduce(
          (acc, directory) =>
            `${acc}${pad(directory, maxLength + 2)}: ${
              savedLines[directory].message
            }\n`,
          ""
        )
    );
  }
};
