import test from "tape";
import promisify from "../src/promisify";

const callbackFunction = () => {
  let callback = () => {};

  return {
    resolve: () => {
      callback && callback();
    },
    reject: message => {
      callback && callback(new Error(message));
    },
    runnable: (...args) => {
      callback = args[args.length - 1];
    }
  };
};

test("promisify (resolution)", assert => {
  const cbf = callbackFunction();

  const testedPromisified = promisify(cbf.runnable);

  testedPromisified().then(
    () => {
      assert.pass("Resolving should be resolved.");
      assert.end();
    },
    () => {
      assert.fail("Resolution should not be rejected");
    }
  );
  cbf.resolve();
});

test("promisify (rejection)", assert => {
  const cbf = callbackFunction();

  const testedPromisified = promisify(cbf.runnable);
  const message = "ERROR MESSAGE";

  testedPromisified().then(
    () => {
      assert.fail("Rejection should not be resolved");
    },
    error => {
      assert.equal(
        error.message,
        message,
        "Error message should be propagated"
      );
      assert.pass("Rejected callback is rejected in promise.");
      assert.end();
    }
  );

  cbf.reject(message);
});

test("Promisify should throw when not passed a function", assert => {
  assert.throws(
    () => {
      promisify("fun");
    },
    new Error(),
    "Throws an error"
  );
  assert.end();
});
