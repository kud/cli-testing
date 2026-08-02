# Changelog

All notable changes to this project are documented here.

---

## Unreleased — 2026-08-02

### Documentation

- Added MDX documentation for the package, and corrected the README and source comments that described `@kud/cli-shot` as built on top of this package — they're siblings sharing an app contract, with no dependency in either direction; `runCli`'s HOME isolation would only get in a screenshot's way. ([660ec17](https://github.com/kud/cli-testing/commit/660ec17ef7a375dc50f0c0b2cc54cb4b20277bb5), [16eaab2](https://github.com/kud/cli-testing/commit/16eaab22f561bf8e5f1f9ab6c3a820862bf378f2))

<details>
<summary>Internal (1 commit)</summary>

- Stabilised a flaky frame-history test (a fixture was updating state directly from its effect, which React could batch into the initial render) and applied hygiene fixes from the `/k-repo` audit — README shape, `.gitignore` entries. ([c761ca7](https://github.com/kud/cli-testing/commit/c761ca7224c4b192c05fbb356d95ceacad471a63))

</details>

---

## 0.1.0 — 2026-08-02

### Highlights

- Initial release: `renderFrames()` wraps `ink-testing-library` and defaults every reader to the full frame history rather than the last frame — a command that renders, fetches, then exits unmounts itself the instant its data lands, so asserting on the last frame races to empty on exactly the commands that work. `waitFor()` polls that history and reports the frames it did see if a wait times out. ([04ffcd6](https://github.com/kud/cli-testing/commit/04ffcd63e2d89252c5db62d214066e5fbe44582a))
- `runCli()` gives every run an isolated harness: a fresh temporary `HOME` (with `cwd` pointed at the same directory, so a stray `dotenv.config()` can't climb back out to the repo's own `.env`), plus named environment variables scrubbed. ([04ffcd6](https://github.com/kud/cli-testing/commit/04ffcd63e2d89252c5db62d214066e5fbe44582a))
- `ink-testing-library` ships as a peer dependency rather than a regular one, so it binds to your project's own React and Ink instead of installing a second copy — a second copy makes every hook call fail with "more than one copy of React". ([14eab82](https://github.com/kud/cli-testing/commit/14eab829d0842ed65e84aff4984bd11607c68760))

<details>
<summary>Internal (1 commit)</summary>

- Added a CI workflow that runs checks on pull requests and publishes on tags. ([cfe5b26](https://github.com/kud/cli-testing/commit/cfe5b26633989df46e703a722db09c6a6405f6f2))

</details>

---
