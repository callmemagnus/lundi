const fs = require('fs-extra');
const path = require('path');
const debug = require('debug')('libs/files');
const promisify = require('./promisify');

// const currentDirectory = () => path.basename(process.cwd());
const currentDirectory = () => process.cwd();
const directoryExists = filePath => {
  debug('directoryExists on %s', filePath);
  try {
    return fs.statSync(filePath).isDirectory();
  } catch (err) {
    return false;
  }
};
const removeDir = (directory) => promisify(fs.remove, fs)(directory);
const createDir = (directory) => promisify(fs.mkdirs, fs)(directory);

const fileExists = filePath => {
  debug('fileExists on %s', filePath);
  try {
    return fs.statSync(filePath).isFile();
  } catch (e) {
    return false;
  }
};

const getDirectoriesIn = directory => {
  debug('getDirectoriesIn %s', directory);
  return fs.readdirSync(directory)
    .filter(file => fs.statSync(path.join(directory, file)).isDirectory());
};

const writeJSON = (filename, obj) => promisify(fs.writeJson, fs)(filename, obj)
  .catch(() => {
    Promise.reject(`Failed writing ${filename}.`);
  });

const readJSON = filename => promisify(fs.readJson, fs)(filename)
  .catch(() => {
    Promise.reject(`Failed reading ${filename}.`);
  });

module.exports = {
  currentDirectory,
  directoryExists,
  removeDir,
  createDir,
  fileExists,
  getDirectoriesIn,
  readJSON,
  writeJSON
};
