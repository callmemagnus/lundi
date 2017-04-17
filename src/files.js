import fs from 'fs-extra';
import path from 'path';
import Debug from 'debug';
import promisify from './promisify';


const debug = Debug('files');

/**
 * Get the path to current directory
 * @return {String}
 */
export const currentDirectory = () => process.cwd();

/**
 * Check whether the directory exists
 * @param {String} pathToDirectory absolute path to directory to test 
 * @return {Boolean} 
 */
export const directoryExists = pathToDirectory => {
  debug('directoryExists on %s', pathToDirectory);
  try {
    return fs.statSync(pathToDirectory).isDirectory();
  } catch (e) {
    return false;
  }
};

/**
 * Deletes the directory
 * 
 * @param {String} directoryToRemove 
 */
export const removeDir = directoryToRemove => promisify(fs.remove, fs)(directoryToRemove);

/**
 * Makes the directory
 * @param {String} directoryToCreate 
 * @return {Promise}
 */
export const createDir = directoryToCreate => promisify(fs.mkdirs, fs)(directoryToCreate);

/**
 * Check whether the file exists
 * @param {String} pathToFile absolute path to file
 * @return {Boolean}
 */
export const fileExists = pathToFile => {
  try {
    return fs.statSync(pathToFile).isFile();
  } catch (e) {
    return false;
  }
};

/**
 * Fetch all the directories in a directory
 * @param {String} directory
 * @return {Array<String>} relative path to directory in the parentDirectory
 */
export const getDirectoriesIn = parentDirectory => {
  debug('getDirectoriesIn %s', parentDirectory);
  return fs.readdirSync(parentDirectory)
    .map(file => path.join(parentDirectory, file))
    .filter(directoryExists)
    .map(absolutePath => path.relative(parentDirectory, absolutePath));
};

/**
 * Write content of obj as JSON in a file
 * @param {String} filename 
 * @param {Object} obj object to write in the file
 * @returns {Promise}
 */
export const writeJSON = (pathToFile, obj) => promisify(fs.writeJson, fs)(pathToFile, obj)
  .catch(() => Promise.reject(`Failed writing ${pathToFile}.`));

/**
 * Read a file as JSON conten
 * @param {String} filename path to the file to read as JSON
 * @return {Promise<Object>} 
 */
export const readJSON = pathToFile => promisify(fs.readJson, fs)(pathToFile)
  .catch(() => Promise.reject(`Failed reading ${pathToFile}.`));

export default {
  currentDirectory,
  directoryExists,
  removeDir,
  createDir,
  fileExists,
  getDirectoriesIn,
  readJSON,
  writeJSON
};
