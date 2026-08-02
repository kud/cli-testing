import { test, expect } from "vitest"
import { runCli } from "./run.js"

const node = process.execPath

test("captures stdout and the exit status", () => {
  const run = runCli(node, ["-e", "console.log('hi'); process.exit(3)"])

  expect(run.stdout.trim()).toBe("hi")
  expect(run.status).toBe(3)
})

test("captures stderr separately from stdout", () => {
  const run = runCli(node, ["-e", "console.error('bad')"])

  expect(run.stderr.trim()).toBe("bad")
  expect(run.stdout).toBe("")
})

// The point of the whole helper. Without this the test inherits whatever
// credential the developer happens to be logged in with, and a "logged out"
// assertion quietly stops testing anything.
test("scrub withholds a variable the parent has", () => {
  process.env.CLI_TESTING_FIXTURE = "leaked"

  const kept = runCli(node, [
    "-e",
    "console.log(process.env.CLI_TESTING_FIXTURE)",
  ])
  const scrubbed = runCli(
    node,
    ["-e", "console.log(process.env.CLI_TESTING_FIXTURE)"],
    { scrub: ["CLI_TESTING_FIXTURE"] },
  )

  expect(kept.stdout.trim()).toBe("leaked")
  expect(scrubbed.stdout.trim()).toBe("undefined")

  delete process.env.CLI_TESTING_FIXTURE
})

test("scrub wins over an explicitly passed env of the same name", () => {
  const run = runCli(node, ["-e", "console.log(process.env.TOKEN)"], {
    env: { TOKEN: "set-by-caller" },
    scrub: ["TOKEN"],
  })

  expect(run.stdout.trim()).toBe("undefined")
})

test("HOME is a fresh directory, not the developer's", () => {
  const run = runCli(node, ["-e", "console.log(process.env.HOME)"])

  expect(run.stdout.trim()).not.toBe(process.env.HOME)
  expect(run.stdout.trim()).toContain("cli-testing-home-")
})

// Scrubbing the environment is not enough while a .env sits in the repo the CLI
// was started from — dotenv.config() would read it and hand back exactly what
// was withheld. Running from the temp HOME is what closes that.
test("cwd is the temp home, so a repo .env is out of reach", () => {
  const run = runCli(node, ["-e", "console.log(process.cwd())"])

  expect(run.stdout.trim()).not.toBe(process.cwd())
  expect(run.stdout.trim()).toContain("cli-testing-home-")
})

test("the temp home is removed afterwards", () => {
  const run = runCli(node, ["-e", "console.log(process.env.HOME)"])
  const home = run.stdout.trim()

  expect(
    runCli(node, [
      "-e",
      `console.log(require('fs').existsSync('${home}'))`,
    ]).stdout.trim(),
  ).toBe("false")
})
