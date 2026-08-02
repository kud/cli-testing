import { render } from "ink-testing-library"
import type { ReactElement } from "react"

export type WaitOptions = {
  /** Milliseconds before giving up. */
  timeout?: number
  /** Milliseconds between checks. */
  interval?: number
}

export type Rendered = {
  /** Every frame ink has produced so far, joined. What assertions want. */
  output: () => string
  /** The most recent frame alone. See the note below before reaching for it. */
  lastFrame: () => string
  /** Resolves with the output once `needle` appears in it. */
  waitFor: (needle: string | RegExp, options?: WaitOptions) => Promise<string>
  /** Send input, as a user would. */
  write: (input: string) => void
  unmount: () => void
}

const found = (haystack: string, needle: string | RegExp): boolean =>
  typeof needle === "string" ? haystack.includes(needle) : needle.test(haystack)

// A command that renders, fetches, then calls useExit unmounts itself the
// moment its data lands — and an unmounted component's last frame is empty. So
// asserting on the last frame races the unmount and fails on exactly the
// commands that work, while passing on ones that hang. Every reader here is
// backed by the frame history instead, which persists after unmount.
//
// lastFrame is still exposed, because a test about what the user is left
// looking at genuinely wants it. It is the default that was wrong, not the
// capability.
export const renderFrames = (element: ReactElement): Rendered => {
  const instance = render(element)
  const output = () => instance.frames.join("\n")

  // Polled rather than hooked into ink's render cycle: the frame that satisfies
  // the wait is usually produced by a promise the test never holds a reference
  // to, so there is nothing to await except the output itself.
  const waitFor = async (
    needle: string | RegExp,
    { timeout = 2_000, interval = 10 }: WaitOptions = {},
  ): Promise<string> => {
    const deadline = Date.now() + timeout
    for (;;) {
      const current = output()
      if (found(current, needle)) return current
      if (Date.now() >= deadline) {
        throw new Error(
          `Timed out after ${timeout}ms waiting for ${needle}.\n` +
            `Frames so far:\n${current || "(nothing rendered)"}`,
        )
      }
      await new Promise((resolve) => setTimeout(resolve, interval))
    }
  }

  return {
    output,
    lastFrame: () => instance.lastFrame() ?? "",
    waitFor,
    write: (input: string) => instance.stdin.write(input),
    unmount: () => instance.unmount(),
  }
}
