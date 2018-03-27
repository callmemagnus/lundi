import chalk from "chalk";
import figlet from "figlet";

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
