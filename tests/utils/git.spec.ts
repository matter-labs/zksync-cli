import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { cloneRepo } from "../../src/utils/git.js";

describe("cloneRepo", () => {
  let tmpDir: string;
  let sourceRepo: string;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "zksync-cli-git-"));
    sourceRepo = path.join(tmpDir, "source");
    fs.mkdirSync(sourceRepo);
    execFileSync("git", ["init", "-q"], { cwd: sourceRepo });
    fs.writeFileSync(path.join(sourceRepo, "README.md"), "template\n");
    execFileSync("git", ["add", "."], { cwd: sourceRepo });
    execFileSync("git", ["-c", "user.name=test", "-c", "user.email=test@example.com", "commit", "-q", "-m", "init"], {
      cwd: sourceRepo,
    });
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test("clones into a destination path that contains spaces", async () => {
    const destination = path.join(tmpDir, "John Smith", "my project");
    await cloneRepo(sourceRepo, destination, { silent: true });
    expect(fs.existsSync(path.join(destination, "README.md"))).toBe(true);
  });
});
