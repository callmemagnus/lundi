/**
 * 
 * @param {Function} fun 
 * @param {Object} cont 
 */
const promisify = (fun, functionContext) => {
  if (typeof fun !== 'function') {
    throw 'promisify requires a function as paramater';
  }

  return (...params) => {
    return new Promise(function(resolve, reject) {
      const context = functionContext ? functionContext : null;

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