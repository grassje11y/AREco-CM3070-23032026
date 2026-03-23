AREco Final Year Project CM3070

Template: Mobile Development, 10.2 Project Idea 1: Developing a Gamified AR App for Eco-Conscious Urban Exploration, with a focus on environmental and social sustainability
	
# Run
npm start
press s to switch it to expo.
(do NOT run it on development, it was a test for AR )
run it on expo, test it on a mobile device as the chatbot and search engine do not work on the web


## Tests

Jest with the `jest-expo` preset. Specs live under `test/` (`*.test.js`).

```bash
npm test
npm run test:watch
```

**Logs / reports**

- `npm run test:report` — writes full JSON results to `test/last-results.json` (ignored by git).
- `npm run test:log` — runs tests, updates that JSON, and **appends one line** per run to `test/run-history.log` (timestamp, exit code, pass/fail counts). Commit `run-history.log` if you want a history in the repo; otherwise add it to `.gitignore`.

# structure
App.js — root state, navigation between screens, AsyncStorage persistence
screens/ — UI screens (home, scan, games, history, settings, chat, NEA, prizes, AR, etc.)
components/ — shared UI (e.g. quick menu)
games/ — mini-games
constants/ — challenges, dates, streak logic, storage helpers
context/ — settings (theme, font scale)
test/ — Jest tests

