import React, { useEffect, useState } from "react"
import { Text } from "ink"
import { test, expect } from "vitest"
import { renderFrames } from "./render.js"

// The update is deferred through a timer rather than set straight from the
// effect: React may batch an effect's setState into the initial render, which
// yields a single frame and makes the history test pass or fail depending on
// scheduling. A timer cannot be batched with the first paint, so there are
// always two distinct frames to find.
const Changing = () => {
  const [n, setN] = useState(0)
  useEffect(() => {
    const later = setTimeout(() => setN(1), 20)
    return () => clearTimeout(later)
  }, [])
  return <Text>value {n}</Text>
}

// The whole reason this package exists: a component that updates has already
// moved past the frame a test cares about by the time the test looks. Reading
// the history finds it; reading the last frame does not.
test("output keeps earlier frames that lastFrame has moved past", async () => {
  const ui = renderFrames(<Changing />)
  await ui.waitFor("value 1")

  expect(ui.output()).toContain("value 0")
  expect(ui.lastFrame()).not.toContain("value 0")
  ui.unmount()
})

test("waitFor accepts a pattern as well as a string", async () => {
  const ui = renderFrames(<Changing />)
  expect(await ui.waitFor(/value\s+1/)).toContain("value 1")
  ui.unmount()
})

// A bare timeout tells you a wait failed but not why. Putting the frames in the
// message means the usual cause — the text rendered, differently spelled — is
// visible without rerunning under a debugger.
test("a timeout reports what was on screen instead", async () => {
  const ui = renderFrames(<Text>rendered something else</Text>)

  await expect(ui.waitFor("never appears", { timeout: 50 })).rejects.toThrow(
    /rendered something else/,
  )
  ui.unmount()
})

test("waitFor returns immediately when the text is already there", async () => {
  const ui = renderFrames(<Text>instant</Text>)
  expect(await ui.waitFor("instant")).toContain("instant")
  ui.unmount()
})
