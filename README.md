# Flash

A local-first flashcard tool for people and their agents. Cards are Markdown questions and answers, organized into decks. New cards start as drafts and must be approved in the UI before review.

## Start

Install Bun 1.4.4, then run:

```sh
bun install
bun run build
bun run flash -- help
bun run flash -- ui
```

Open http://127.0.0.1:3000. The server listens only on localhost. Set `PORT` to change the port. Rebuild after changing the UI.

## Create cards

Create a JSON file containing an array, then run `bun run flash -- create cards.json`. Use `-` instead of a filename to read stdin. A batch is validated before any cards are written.

```json
[
  {"deck":"Biology","question":"What is **mitosis**?","answer":"Cell division producing two daughter cells.","tags":["cells"],"source":"Chapter 3"}
]
```

`deck`, `question`, and `answer` are required non-empty strings. `tags` is an optional array of strings; `source` is an optional string. `list`, `decks`, and `history` print JSON. Errors go to stderr and exit nonzero. Run `bun run flash -- help` for commands.

Approve drafts in the UI, edit their fields in the library, and review due cards using Again, Hard, Good, or Easy. Again schedules ten minutes later; the other ratings grow the interval in days. Review history and scheduling survive restarts. This is a simple scheduling algorithm, not an implementation of a named spaced repetition system.

The SQLite database defaults to `$XDG_DATA_HOME/flash/flash.sqlite`, or `~/.local/share/flash/flash.sqlite`. Set `FLASH_DB` to use another path. Back up the database while the app is stopped, including any SQLite WAL files if present.

Run `bun run typecheck` and `bun test` for checks. MIT licensed.
