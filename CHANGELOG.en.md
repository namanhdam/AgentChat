# Changes

## 0.11.0 · 2026-10-23

### New
- The interface is now also available in English and Japanese: pick one in Settings › Language and the app reloads in the new language right away. On first launch the app follows the operating system's language.
- The menus, dialogs, system messages in the chat and the list of changes follow the chosen language too. Agents are told to reply in that language.

## 0.10.0 · 2026-10-15

### New
- When a box has an agent running, the # before its name in the sidebar (and in ⌘K) becomes a pulsing green dot; hover to see how many agents are running.
- A chain of agents stops on its own after 3 turns in a row that change neither code nor a task's status (just chatting back and forth), on top of the turn limit and the cost ceiling. The stop card says why and who is waiting; the **Continue** button runs only what hasn't run yet, even if the app was closed midway.
- Merge errors come with details: the phase, the kind of error, the files, the failing command and an excerpt of the log.
- A **Take main (back up branch)** button for a stuck merge item when what needs keeping is already on main: the agent's branch is saved to a backup branch, after you confirm.

### Changes
- A leaner team process: the PM closes tasks without attaching evidence; agents call whoever does the next step directly (dev → qa → pm), and the PM doesn't relay messages.
- Turns that only change `reports/` or `.md` files are merged right away, without running checks.
- Each branch has only one item in the merge queue: a turn that changes nothing no longer adds a duplicate. A repeated agent message doesn't call its recipients twice.
- Task board: names take at most two lines, with the assignee on the line below.
- Auto-summarizing the history runs faster; a summary that is too long is trimmed instead of failing and rerunning after every turn (the PM "running on its own without answering").

### Fixes
- No more "Object has been destroyed" error when switching between light and dark after closing the window.

## 0.9.0 · 2026-10-14

### New
- The right panel has two tabs: **Overview** (Needs you, Task board, Merge queue, Shared files) and **Project**. The Overview tab shows how many items need you.
- The **Project** tab shows the file tree of the main folder, of an agent's unmerged branch, or of a recent commit. Changed files are labeled M (modified), A (added), D (deleted), U (new, uncommitted); folders holding changed files get a dot. A "Changed" button shows only changed files, and a box filters by name.
- Click a modified or deleted file to see its diff right in the viewer. Right-click to open the file, view its changes, or copy its relative or full path.

### Changes
- Each agent turn lands on the main branch as exactly one (squashed) commit, instead of the pair "agent X: finished turn" + "merge agent X". The commit is named after the agent and the work done, for example `dev-be · T43 Per-turn diff`, or after the files changed when the turn has no task.
- After a merge, an idle agent's branch is brought up to the main branch right away; a running agent's is brought up at the start of its next turn.

## 0.8.0 · 2026-10-13

### New
- A **Settings** button at the bottom of the sidebar replaces the version line. The settings window has a sidebar of sections and a search box (accents optional).
- **Agent:** the app finds `claude`, `codex` and `agy` in PATH and the usual install folders (Homebrew, npm, nvm, bun…), and shows their versions and whether each account is signed in. There are Scan, Test connection and Add manually buttons to pick a different executable. Launched from Finder, the app still finds the CLIs even without the shell's PATH.
- **Font:** pick the interface font from the fonts installed on the machine, and a message text size from 12 to 20px.
- **About:** the version, author, license, a link to the source code and the list of changes, replacing the old About dialog.
- The MCP, Skill and Language sections and the Gemini, Qwen, Kimi, Copilot and Cursor CLIs are marked "coming soon".

### Changes
- Team settings drops the "+ Add agent" button (there is already a + next to "Members") and the "Test connection" button (moved to Settings › Agent).
- When a CLI isn't found, the error in the chat points to Settings › Agent instead of showing `spawn ENOENT`.

## 0.7.0 · 2026-10-13

### New
- The file viewer can be resized: drag the corner or use the arrow keys, with Maximize / Restore buttons. The app remembers the last size and mode.
- Clicking a link to a PNG, JPEG, GIF, WebP or SVG image shows it right in the viewer, with "Fit" and "100%" buttons. SVG images also show in the chat and in `.md` files.
- HTML files have two tabs, Preview and Source. The preview runs no JavaScript, loads nothing from the network and never navigates away; CSS and images inside the project still show. The "Open in browser" button asks again before opening the full page.
- Links to files in agents' messages open in the app, including `file://` links, absolute paths inside an agent's own branch, and file names such as `renderer.js` in text or in code.
- Consecutive successful system messages ("moved T… to…", "Merged the branch…") are folded into one "N updates · View" line. Errors and stopped chains still show in full.
- Shared files pins `memory.md` and `roadmap.md` to the top and groups the other files by sprint. The merge queue hides when it's empty. The section headers in the right column are clearer, with icons and open/close arrows.
- The running bar shows a short label ("Running a command"); click it to see the full command. The "Timeline · Cost" button is easier to spot.

### Fixes
- An agent starts a new session based on the context size of the last step of a turn, not on the whole turn's token total. Turns that use many tools no longer rotate sessions early. The popup on the avatar shows the context size.
- The merge queue no longer gets stuck at "Missing dependency" when the main branch only changed the version number. Dependencies are checked after the trial merge, so a branch that really changes dependencies is still blocked.
- When an agent merges the main branch into its own branch, the files brought in from main are no longer counted as edits outside its scope, and that turn is still queued for merging.
- Every failed merge gets a system message in the chat.
- agy: a turn that already answered is no longer reported as an error just because agy attached the previous turn's error (out of quota, a 500 it retried past). Error messages no longer repeat the same sentence with raw JSON.

### Security
- The app window runs in sandbox mode. Only the main page can call IPC; the HTML preview frame cannot.

## 0.6.0 · 2026-10-12

### New
- Retract your messages: hover a message and click the retract button twice. Agents no longer see its content; turns started only by that message (waiting or running) are stopped. If the composer is empty, the message's text is put back so you can edit and resend it.
- A custom set of SVG icons replaces the emoji (⚙, 🌿, ⏱, ⚠️, 🚫, ✕…), drawn with the same stroke as the app's interface.

### Fixes
- Agents are no longer blocked forever with the error "The workspace has changes the app hasn't recorded". The app checks the workspace when a turn starts running instead of when it is queued. It also accepts an agent committing or merging branches itself, and commits leftover changes from a previous turn on its own if they are within the agent's scope.

## 0.5.0 · 2026-10-12

### New
- The name line on each agent message also shows the model that ran that turn, for example `claude · opus-5-5`, `codex2 · GPT-6.1-Sol`. Claude reports the real model, even when left at Default or set to a short name such as opus; Codex takes the chosen model or the default model in the account's configuration; agy shows it only when you pick a model in ⚙.

## 0.4.0 · 2026-10-12

### New
- Paste (⌘V) or drop PNG, JPEG, GIF or WebP images into the composer: they show as thumbnails with a × button to remove them, and are sent with the message. Images being composed are kept per box, like the text.
- Images show right in the chat, including those agents send; click an image to open it large.
- Agents (Claude, Codex, agy) receive the image paths and open the images themselves. Agents can also send images, such as screenshots, to the chat.

### Security
- Images are accepted by file content, not by extension; SVG and files outside the project are blocked. Images from outside links don't load on their own and only show as links.

## 0.3.0 · 2026-10-09

### New
- Drag the left edge of the right panel to resize it, up to 1/3 of the window (the chat always keeps at least 520px); double-click to reset, and the app remembers the width.
- The cost (tokens, USD) of the whole box moves into the Timeline; the right panel is trimmed to the Task board and Shared files.
- A theme button at the foot of the sidebar: System, Light, Dark; the menus and system dialogs follow it, and the app remembers the choice.

## 0.2.0 · 2026-10-08

### New
- A minimal interface: hairline borders, one accent color, initials avatars in each agent's color, the Inter and JetBrains Mono fonts.
- **Needs you** collects the messages where agents ask you something, chains paused waiting to continue, and permission requests. Approve, ask for changes or decline right on the card; each space has a badge counting its items, plus a system notification.
- The line of a running agent has a clock, "turn N (max M)", an estimate of the time left, and a reminder when the agent has been quiet for long.
- Timeline: which agent ran when, and for how long.
- The task board groups tasks by status, with a progress bar; the Done group starts collapsed.
- Shortcuts: ⌘K switches space (accents optional), ⌘1…9, ⌘J goes to the box that needs you, ⌘F searches, ⌘⇧T timeline, ⌘, settings.
- Message drafts are kept per box; day separators in the chat history.
- A new icon, an About section with the list of changes; the window remembers its size and position.

### Fixes
- A long shared-files list no longer covers the task board; every long list scrolls inside its own frame.
- Agents no longer receive the whole context again on each turn of a session in use.
- Merge checks run outside the git lock and no longer block other agents.
- The chat history no longer skips messages when scrolling; a failed send puts the text back into the composer.
- The app asks before quitting while agents are still running.

### Security
- Agents run only with a team configuration you have accepted; a configuration edited on disk must be approved again.
- Commands and merge checks for codex/agy run in a sandbox; read-only mode applies to every CLI.
- Values in a box's files never become command-line arguments; files are written safely with respect to symlinks; git run by the app skips the repo's hooks.
- A stricter content policy; the app asks before opening a link whose visible text differs from its real address.

## 0.1.0 · 2026-10-07

The first release.
- Each project folder is a chat box for a team of agents (Claude Code, Codex, agy); one folder can hold several independent boxes.
- Call agents with @name; without an @ the PM receives the message; chains of agents calling each other have a turn limit.
- A task board, shared files and a shared team memory.
- A worktree for each agent and a merge queue with a check step.
- Search and paging through the history, token and cost statistics.
- Session management for each CLI, and granting tool permissions right in the chat.
- Runs on macOS and Windows.
