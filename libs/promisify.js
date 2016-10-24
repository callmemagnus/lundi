const debug = require('debug')('promisify');

module.exports = (fun, cont) => {
  if (typeof fun !== 'function') {
    debug('not a function');
    throw 'promisify requires a function as paramater';
  }

  return (...params) => {
    return new Promise(function(resolve, reject) {
      var context = cont ? cont : null;

      fun.apply(context, [...params, (error, data) => {
        if (error) {
          reject(error);
        }

        resolve(data);
      }]);
    });
  };
};
