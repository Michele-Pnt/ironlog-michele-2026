# Weekly Check-in and iPhone Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local-first weekly check-in form and one-tap iPhone-friendly export without losing existing Ironlog workout or nutrition data.

**Architecture:** Keep the current single-page static app and extend its versioned `state` object with `checkIns`. Add pure serialization/validation helpers to `app.js`, render a new `checkin` view, and expose a text/JSON export through the Web Share API with clipboard/download fallbacks. Preserve the existing `localStorage` key and migrate missing fields non-destructively.

**Tech Stack:** Vanilla HTML, CSS, JavaScript, `localStorage`, Web Share API, Clipboard API, browser download fallback, Node built-in test runner for pure helpers.

**Spec:** `docs/superpowers/specs/2026-10-01-ironlog-coach-program-design.md`

## Global Constraints

- All persistent files remain inside the Ironlog workspace.
- User data remains local-first on the device.
- The existing `localStorage` state must migrate without deleting logs, programs, or settings.
- Export/import JSON remains available.
- No cloud sync or remote transmission of personal data is added.
- The UI must remain usable on a narrow iPhone viewport.
- The check-in must support daily weight history and a weekly summary without treating one measurement as decisive.

## Review Focus

- Existing state without `checkIns`: migration must add an empty array and preserve every existing key.
- Check-in with decimal values and empty optional fields: numeric fields must remain numeric or `null`, never `NaN`.
- Multiple check-ins for the same week: saving must update the selected week rather than create ambiguous duplicates.
- iPhone without Web Share or Clipboard support: export must still offer a downloadable text/JSON fallback.
- Export content containing Italian accents and line breaks: copied/shared text must remain readable and valid UTF-8.

### Task 1: Add pure check-in state helpers and migration

**Files:**
- Modify: `app.js` near `defaultState`, `save`, and `globalThis.IronlogLogic`
- Create: `tests/checkin-logic.test.js`

**Interfaces:**
- `normalizeState(rawState) -> state`: returns a state object with `checkIns: []` when missing, preserving all existing properties.
- `normalizeCheckIn(input) -> checkIn`: converts numeric fields to finite numbers or `null`, trims text fields, and assigns a stable `weekKey`.
- `upsertCheckIn(checkIns, checkIn) -> checkIns`: replaces the existing check-in with the same `weekKey`, otherwise appends it, sorted newest first.
- `buildWeeklySummary(state, weekKey) -> object`: returns the selected check-in plus the seven-day weight average from existing weight records when available.
- `serializeCheckInForShare(summary) -> string`: returns readable Italian plain text suitable for iPhone share/clipboard.

- [ ] **Step 1: Write failing tests for migration and numeric normalization**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeState, normalizeCheckIn, upsertCheckIn, serializeCheckInForShare } from '../app-logic.mjs';

test('migration adds checkIns without changing existing data', () => {
  const oldState = { programs: [{ id: 'p1' }], logs: [{ date: '2026-10-01' }], view: 'train' };
  const next = normalizeState(oldState);
  assert.deepEqual(next.programs, oldState.programs);
  assert.deepEqual(next.logs, oldState.logs);
  assert.deepEqual(next.checkIns, []);
});

test('check-in converts blank optional numbers to null', () => {
  const result = normalizeCheckIn({ weekKey: '2026-W40', averageWeight: '79.35', bodyFat: '', calories: '2200', notes: '  bene  ' });
  assert.equal(result.averageWeight, 79.35);
  assert.equal(result.bodyFat, null);
  assert.equal(result.calories, 2200);
  assert.equal(result.notes, 'bene');
});

test('upsert keeps one check-in per week', () => {
  const result = upsertCheckIn([{ weekKey: '2026-W40', calories: 2200 }], { weekKey: '2026-W40', calories: 2300 });
  assert.deepEqual(result, [{ weekKey: '2026-W40', calories: 2300 }]);
});

test('share text contains readable summary fields', () => {
  const text = serializeCheckInForShare({ weekKey: '2026-W40', averageWeight: 79.35, bodyFat: 13.4, calories: 2300, notes: 'recupero buono' });
  assert.match(text, /79,35/);
  assert.match(text, /13,4/);
  assert.match(text, /recupero buono/);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test tests/checkin-logic.test.js`  
Expected: FAIL because `app-logic.mjs` does not yet exist.

- [ ] **Step 3: Extract pure helpers into `app-logic.mjs` and expose the same helpers from `app.js`**

Use named exports with the exact signatures above. Keep browser-only DOM code out of `app-logic.mjs`; `app.js` imports the helpers and continues to own rendering and persistence.

- [ ] **Step 4: Replace direct state initialization with non-destructive normalization**

Load JSON from `localStorage`, call `normalizeState(parsedState)`, and save only if the normalized structure added missing defaults. Do not reset an existing `programs`, `logs`, `view`, `selectedDate`, or active IDs.

- [ ] **Step 5: Run the focused tests and verify they pass**

Run: `node --test tests/checkin-logic.test.js`  
Expected: PASS for migration, numeric normalization, upsert, and share serialization.

- [ ] **Step 6: Commit the pure state layer**

Run: `git add app-logic.mjs app.js tests/checkin-logic.test.js && git commit -m "feat: add local weekly check-in state helpers"`

### Task 2: Build the weekly check-in form and nutrition/training fields

**Files:**
- Modify: `index.html` navigation labels and `app.js` view routing/rendering
- Modify: `style.css` check-in cards, form controls, validation states, and mobile layout

**Interfaces:**
- `renderCheckin() -> void`: renders the check-in view.
- `readCheckInForm(form) -> object`: reads the form into the helper input shape.
- `saveCheckInFromForm(form) -> void`: normalizes, upserts, saves, and re-renders.

- [ ] **Step 1: Add the check-in navigation entry and route test hook**

Add a `checkin` navigation button labelled `Check-in` and route `state.view === 'checkin'` to `renderCheckin()`. Keep all existing views and navigation working.

- [ ] **Step 2: Add the form markup generated by `renderCheckin()`**

The form must include:

```text
Settimana
Peso medio 7 giorni
Peso minimo/massimo opzionale
Body fat opzionale
Calorie medie
Proteine medie opzionali
Carboidrati medi opzionali
Grassi medi opzionali
Allenamenti completati / previsti
Passi medi
Cardio (minuti e tipo, opzionale)
Sonno medio
Fame da 1 a 5
Stress da 1 a 5
Recupero da 1 a 5
Performance: peggiorata / stabile / migliorata
Cedimenti, dolori o sintomi
Note libere
```

Use `inputmode="decimal"` for decimal numeric inputs, constrained selects for 1–5 scales, and an explicit save button labelled `Salva check-in`.

- [ ] **Step 3: Pre-fill the selected week and latest known values without overwriting unsaved input**

On opening the view, select the current ISO week. If a saved check-in exists for that week, populate it. Otherwise show the seven-day average calculated from available weight logs as a read-only hint, leaving the editable field blank or prefilled only when the value is already persisted.

- [ ] **Step 4: Add validation and accessible inline errors**

Reject impossible values such as negative weight, body fat outside 1–60, negative calories, or ratings outside 1–5. Keep the user on the form, identify the invalid field with `aria-invalid="true"`, and display a concise Italian error message.

- [ ] **Step 5: Add a compact saved-history section**

Show the latest eight weekly check-ins with week, average weight, body fat, calories, and a short performance label. Add an edit action that loads the selected week back into the form.

- [ ] **Step 6: Add mobile-first styles**

Use the existing design tokens and cards. Keep primary actions visible near the form footer, ensure controls are at least 44px high, and avoid a dense two-column layout on narrow screens.

- [ ] **Step 7: Manually verify the form in a browser**

Run a local static server, open the app, save a check-in, refresh, edit it, navigate to another tab, return, and confirm the saved check-in remains intact.

- [ ] **Step 8: Commit the check-in form**

Run: `git add index.html app.js style.css && git commit -m "feat: add weekly check-in form"`

### Task 3: Add iPhone-friendly export and backup actions

**Files:**
- Modify: `app.js` check-in view actions and existing export/import section
- Modify: `style.css` export action styles
- Modify: `README.md` usage instructions
- Modify: `AGENTS.md` index entry for check-in behavior
- Modify: `tests/checkin-logic.test.js`

**Interfaces:**
- `exportWeeklyCheckIn(weekKey, mode) -> Promise<void>`: mode is `share`, `clipboard`, or `download`.
- `buildFullDataBackup(state) -> Blob`: produces the existing JSON backup without changing state.

- [ ] **Step 1: Write failing tests for export shape and sensitive-data boundary**

```js
test('share summary is plain text and does not contain program logs', () => {
  const text = serializeCheckInForShare({ weekKey: '2026-W40', averageWeight: 79.35, bodyFat: 13.4, calories: 2300, notes: 'ok' });
  assert.doesNotMatch(text, /workoutId|exerciseId|updatedAt/);
  assert.match(text, /CHECK-IN IRONLOG/);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test tests/checkin-logic.test.js`  
Expected: FAIL until the serialization header and boundary assertion are implemented.

- [ ] **Step 3: Implement the iPhone export fallback chain**

Use this order:

1. `navigator.share({ title: 'Ironlog check-in', text })` when supported and the user selected `Condividi`.
2. `navigator.clipboard.writeText(text)` when supported and the user selected `Copia testo`.
3. Create a UTF-8 `Blob` and trigger an `<a download>` file named `ironlog-checkin-YYYY-Www.txt` when share/clipboard is unavailable.

Never send data automatically. The action must be initiated by a user tap.

- [ ] **Step 4: Add export buttons to the check-in view**

Add `Condividi su iPhone`, `Copia testo` and `Scarica .txt`. Add `Esporta backup completo` as a separate action that downloads the existing full JSON state. The text export must contain only the selected check-in summary and not the entire training log.

- [ ] **Step 5: Add a copy-friendly Italian template**

Use stable labels and one field per line:

```text
CHECK-IN IRONLOG
Settimana: ...
Peso medio 7 giorni: ... kg
Body fat: ... %
Calorie medie: ... kcal
Allenamenti: ... / ...
Passi medi: ...
Sonno: ... h
Fame: .../5
Stress: .../5
Recupero: .../5
Performance: ...
Note: ...
```

- [ ] **Step 6: Add README and AGENTS documentation**

Document that the user can tap `Condividi su iPhone` and paste the resulting text into chat. Document that `Esporta backup completo` remains the recovery mechanism and that no data is uploaded automatically.

- [ ] **Step 7: Run tests and manually verify fallbacks**

Run: `node --test tests/checkin-logic.test.js`  
Expected: PASS.

Manual checks: share-capable browser, clipboard-denied browser, and download fallback. Confirm UTF-8 accents are preserved and the full JSON backup imports into a fresh browser state.

- [ ] **Step 8: Commit the export feature**

Run: `git add app.js style.css README.md AGENTS.md tests/checkin-logic.test.js && git commit -m "feat: add iPhone check-in export"`

### Task 4: Final verification and deploy preparation

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Modify: `README.md`
- Test: `tests/checkin-logic.test.js`

- [ ] **Step 1: Add the GitHub Pages workflow only after local behavior passes**

Use a static Pages deployment workflow that checks out the repository, uploads the repository root as the Pages artifact, and deploys from `main`. The workflow must not read or upload `localStorage`, because local data never exists in the repository.

- [ ] **Step 2: Run the complete local test command**

Run: `node --test tests/*.test.js`  
Expected: PASS with zero failures.

- [ ] **Step 3: Test migration against a pre-check-in state fixture**

Load a state fixture containing programs, logs, active IDs, and no `checkIns`; verify the UI starts normally and all original logs remain available.

- [ ] **Step 4: Verify GitHub Pages build configuration**

Run: `git diff --check` and inspect workflow YAML. Confirm the workflow deploys only committed static files and that the app's origin/path remains stable.

- [ ] **Step 5: Commit deploy preparation**

Run: `git add .github/workflows/deploy.yml README.md tests && git commit -m "ci: deploy Ironlog to GitHub Pages"`

