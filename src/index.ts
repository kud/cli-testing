// @kud/cli-testing — test helpers for Ink CLIs, in two tiers.
//
// renderFrames drives a component in process and reads its frames; runCli
// spawns the real binary in an environment that owns nothing of the developer's.
// Neither knows anything about screenshots. @kud/cli-shot is a sibling rather
// than a dependent — it shares the app contract (--mock, --screen) but none of
// this code, since runCli's HOME isolation would get in a screenshot's way. So
// an assertion library never reaches a capture run, and a renderer never reaches
// a test.
export { renderFrames, type Rendered, type WaitOptions } from "./render.js"
export { runCli, type RunOptions, type RunResult } from "./run.js"
