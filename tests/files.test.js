import test from "tape";

import mock from "mock-fs";
import path from "path";
import {
  fileExists,
  directoryExists,
  createDir,
  getDirectoriesIn,
  readJSON,
  writeJSON,
  removeDir
} from "../src/files";

test("directoryExists", assert => {
  mock({
    dirA: {}
  });

  assert.notOk(
    directoryExists("dirB"),
    "inexstant directory should return false"
  );
  assert.ok(directoryExists("dirA"), "existant directory sould return true");
  mock.restore();
  assert.end();
});

test("fileExists", assert => {
  mock({
    dirA: {
      fileA: "content"
    }
  });

  assert.notOk(
    fileExists(path.resolve("dirA", "fileB")),
    "inexistant file should return false"
  );
  assert.ok(
    fileExists(path.resolve("dirA", "fileA")),
    "existant file should return true"
  );
  mock.restore();
  assert.end();
});

test("removeDir", assert => {
  mock({
    dirA: {}
  });

  removeDir("dirA").then(
    () => {
      assert.notOk(
        directoryExists("dirA"),
        "a deleted directory should not be there anymore."
      );
      mock.restore();
      assert.end();
    },
    () => {
      mock.restore();
      assert.fail("Error while removing file.");
    }
  );
});

test("createDir", assert => {
  mock({});

  createDir("dirA").then(
    () => {
      assert.ok(
        directoryExists("dirA"),
        "a created directory should be on disk"
      );
      mock.restore();
      assert.end();
    },
    () => {
      assert.fail();
      mock.restore();
    }
  );
});

test("getDirectoriesIn", assert => {
  mock({
    dirA: {
      dirB: {},
      fileA: "content of file A",
      dirC: {},
      dirD: {}
    }
  });

  assert.deepEqual(
    getDirectoriesIn("dirA"),
    ["dirB", "dirC", "dirD"],
    "directories should be listed correctly (relative)"
  );
  assert.end();
  mock.restore();
});

test("readJSON", assert => {
  mock({
    dirA: {
      fileA: JSON.stringify({ a: "123" })
    }
  });

  readJSON(path.resolve("dirA", "fileA")).then(
    json => {
      assert.deepEqual(
        json,
        { a: "123" },
        "readJSON sshould read the content of a JSON correctly."
      );
      assert.end();
      mock.restore();
    },
    () => {
      assert.fail();
      mock.restore();
    }
  );
});

test("readJSON when file does not work", assert => {
  mock({
    dirA: {
      fileA: JSON.stringify({ a: "123" })
    }
  });

  readJSON(path.resolve("dirB", "fileA")).then(
    () => {
      assert.fail();
      mock.restore();
    },
    error => {
      assert.ok(
        /^Failed reading/.test(error),
        "readJSON sshould read the content of a JSON correctly."
      );
      assert.end();
      mock.restore();
    }
  );
});

test("writeJSON", assert => {
  mock({
    dirA: {}
  });

  writeJSON("dirA/fileA", { a: "123" }).then(() => {
    assert.ok(fileExists("dirA/fileA", "file is created"));
    readJSON("dirA/fileA").then(
      json => {
        assert.deepEqual(
          json,
          { a: "123" },
          "written file has correct content"
        );
        assert.end();
        mock.restore();
      },
      () => {
        assert.fail("Error while writeJSON,");
        mock.restore();
      }
    );
  });

  writeJSON("dirB/fileB", { a: "123" }).then(
    () => {
      assert.fail();
    },
    error => {
      assert.ok(/^Failed writing/.test(error), "Error should be descriptive.");
    }
  );
});
