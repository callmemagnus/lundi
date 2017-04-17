
/**
 * 
 * @param {Function} fun 
 * @param {} cont 
 */
const promisify = (fun, cont) => {
  if (typeof fun !== 'function') {
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

export default promisify;