import { spawnSync } from "node:child_process"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

export type RunResult = {
  status: number | null
  stdout: string
  stderr: string
}

export type RunOptions = {
  /**
   * Environment names to withhold. A credential inherited from the developer's
   * shell is the usual reason a logged-out test passes locally, fails in CI,
   * and — worst of all — passes in both while asserting nothing.
   */
  scrub?: readonly string[]
  /** Extra environment for the child. Applied before `scrub`, which wins. */
  env?: NodeJS.ProcessEnv
  /** Milliseconds before the child is killed. */
  timeout?: number
  /** Written to the child's stdin. */
  input?: string
}

// Two isolations, and both are load-bearing.
//
// HOME points at an empty directory, so anything reading os.homedir() — a token
// store, a config file — finds nothing, deterministically rather than depending
// on whose machine is running.
//
// cwd goes there too, which is the one that gets missed: a CLI calling
// dotenv.config() reads the .env beside its own source, and would be handed the
// very credentials this run exists to withhold. Scrubbing the environment is
// not enough on its own when the file is still on disk.
export const runCli = (
  command: string,
  args: readonly string[] = [],
  { scrub = [], env = {}, timeout = 60_000, input }: RunOptions = {},
): RunResult => {
  const home = mkdtempSync(join(tmpdir(), "cli-testing-home-"))
  const childEnv: NodeJS.ProcessEnv = { ...process.env, HOME: home, ...env }
  for (const name of scrub) delete childEnv[name]

  try {
    const result = spawnSync(command, [...args], {
      cwd: home,
      env: childEnv,
      encoding: "utf8",
      timeout,
      input,
    })
    return {
      status: result.status,
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? "",
    }
  } finally {
    rmSync(home, { recursive: true, force: true })
  }
}
