# My Reading Shelf Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dependency-free reading shelf that stores book details in this browser and displays optional Open Library covers from valid ISBNs.

**Architecture:** A static HTML page loads a small plain JavaScript book-logic file and a DOM/storage controller. The controller persists entries to `localStorage` and requests covers through lazy-loaded image URLs; pure validation/filtering logic is tested with Node's built-in test runner.

**Tech Stack:** HTML, CSS, browser JavaScript, Node.js built-in `node:test`; no installed packages or build step.

**Spec:** `docs/superpowers/specs/2026-10-11-my-reading-shelf-design.md`

## Global Constraints

- No account, app server, sync, cover crawling or bulk download, metadata lookup, framework, or package dependency.
- The Open Library image URL is the only external runtime request; book details stay in local storage, while each requested ISBN is sent in the public cover URL.
- Normalize and validate ISBN-10/ISBN-13; blank or invalid ISBN does not prevent saving a book or trigger a cover request.
- Use `https://covers.openlibrary.org/b/isbn/{ISBN}-M.jpg?default=false`; lazy-load only individual covers needed for the user's shelf and do not retry missing images.
- Respect Open Library's stated limit of 100 requests per IP per 5 minutes; include a courtesy link to Open Library.
- Render all user-entered text as text, not HTML; provide a clear local-storage warning if persistence fails.

## Review Focus

- Malformed saved JSON: the page should not crash; manually verify it recovers to a usable shelf and explains any persistence issue.
- Browser storage denied or quota failure: show a clear warning and keep the interface usable; manually trigger a save failure in the browser.
- Missing cover or image-network failure: replace the image with a textual fallback and keep the book row usable; manually simulate an image error.
- Search/filter/status interactions: preserve existing cover image elements instead of re-requesting them; manually verify the same image node remains after filtering and status changes.
- HTML-like title/author text: render the string literally without creating elements; manually add a value such as `<img src=x onerror=alert(1)>` and verify it is text.

---

### Task 1: Book and ISBN logic with tests

**Files:**
- Create: `src/books.js`
- Test: `tests/books.test.cjs`

**Interfaces:**
- `normalizeIsbn(value)` returns the trimmed ISBN with spaces and hyphens removed and a final `x` uppercased; other characters remain so validation can reject them.
- `isValidIsbn(value)` accepts ISBN-10 with a digit or `X` check digit, or ISBN-13 beginning `978` or `979` with a valid weighted check digit; it returns `false` for blank, malformed, or bad-checksum input.
- `coverUrlForIsbn(value)` returns `https://covers.openlibrary.org/b/isbn/{normalized-isbn}-M.jpg?default=false` only for a valid ISBN, otherwise `null`.
- `createBook(input, id)` returns `{ id, title, author, language, type, status, isbn }`; trims text, rejects a blank title, normalizes ISBN, allows blank/invalid ISBN, and initializes status to `Want to read`.
- `filterBooks(books, filters)` searches title/author without regard to case and combines optional `search`, `language`, `type`, and `status` filters.
- `setBookStatus(books, id, status)` returns a new array with only the matched record changed to `Want to read` or `Finished`.
- `removeBook(books, id)` returns a new array without only the matched id.
- Export the helpers for Node via `module.exports` and expose them as `window.ReadingShelfBooks` for ordinary browser script tags.

- [ ] **Step 1: Write the failing tests** named `normalizeIsbn_removesSpacesHyphensAndUppercasesX`, `isValidIsbn_acceptsKnownIsbn10AndIsbn13`, `isValidIsbn_rejectsBadChecksumsAndLengths`, `coverUrlForIsbn_returnsMediumUrlOnlyForValidIsbn`, `createBook_keepsBlankOrInvalidIsbnAndStartsWantToRead`, `createBook_rejectsWhitespaceTitle`, `filterBooks_searchesTitleAndAuthorCaseInsensitively`, `filterBooks_combinesLanguageTypeAndStatus`, `setBookStatus_changesOnlyTheRequestedBook`, and `removeBook_removesOnlyTheRequestedBook`. Use ISBN-10 `0385472579` and ISBN-13 `9780385533225` as valid fixtures.
- [ ] **Step 2: Run the tests and verify the RED result** because the book/ISBN module or required helpers are not implemented yet.

Run: `node --test tests/books.test.cjs`

Expected: FAIL because the required module or helper behavior is missing.

- [ ] **Step 3: Implement the specified ISBN, book, and filter helpers** in `src/books.js`, using only the Node/browser standard library.
- [ ] **Step 4: Run the test suite and verify GREEN.**

Run: `node --test tests/books.test.cjs`

Expected: all ten tests pass.

- [ ] **Step 5: Commit the tested book logic and tests.**

### Task 2: Accessible static shelf and careful cover loading

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `src/app.js`
- Use: `src/books.js`

**Interfaces:**
- Load `src/books.js` before `src/app.js` with ordinary script tags; no module server or build is required.
- Store entries under `my-reading-shelf.books.v1` in `localStorage`.
- Provide labeled title, author, language, type, and optional ISBN fields. Explain that valid ISBNs load a cover and that the ISBN is sent to Open Library.
- Provide search, language/type/status filters, reset, book rows, textual cover placeholders, a polite live region for messages, and a footer link to Open Library.

- [ ] **Step 1: Create semantic page markup** for the form, filters, shelf, empty state, status messages, and Open Library courtesy link.
- [ ] **Step 2: Wire adding a book to `createBook`**; allow a blank or invalid ISBN, save the book, and show a no-cover or invalid-ISBN placeholder without requesting an image.
- [ ] **Step 3: Build each valid cover as one `<img>`** using `coverUrlForIsbn`, `loading="lazy"`, descriptive alt text, and a one-way error handler that replaces a failed image with the textual “Cover not available” placeholder.
- [ ] **Step 4: Wire search and combined filters** to `filterBooks`; populate language options from saved entries; update existing row visibility rather than rebuilding cover elements on each keystroke/filter.
- [ ] **Step 5: Wire status changes and removal** to `setBookStatus` and `removeBook`, updating only the affected row where possible.
- [ ] **Step 6: Add safe local-storage loading/saving**. Catch malformed JSON and read/write errors; provide a plain-language warning instead of claiming data was saved.
- [ ] **Step 7: Add responsive styling** using the approved palette (`#EEF4F6`, `#172E3A`, `#52656D`, `#276B67`, `#E3B94F`), a literary serif heading, system sans-serif controls, compact cover thumbnails/placeholders, visible keyboard focus, narrow-screen stacking, and reduced-motion support.
- [ ] **Step 8: Run all unit tests and complete the browser checks.** Use a temporary local preview only, then stop it. Verify blank/invalid ISBNs make no image request but still add the book; a valid ISBN displays a cover; a failed image uses a placeholder; search, combined filters, status, removal, persistence, local-storage errors, malformed JSON, literal rendering of HTML-like text, and mobile layout all behave correctly. Confirm filters do not replace cover image nodes and the app makes no background/bulk requests.

Run: `node --test tests/books.test.cjs`

Expected: all ten tests pass and the manual checks above work without console errors.

- [ ] **Step 9: Commit the working static app** and its source files.

### Task 3: Beginner README and GitHub Pages handoff

**Files:**
- Create: `README.md`

**Interfaces:**
- Explain the app in plain language, local-only storage, ISBN validation, Open Library cover loading, the fact that the ISBN is sent with the image request, the rate-limit/no-bulk-use constraint, the courtesy link, test command, and GitHub Pages setup.

- [ ] **Step 1: Write the README** with a feature summary, no-install run instructions, `node --test tests/books.test.cjs`, and straightforward GitHub Pages steps.
- [ ] **Step 2: Verify the README** names existing files, states that books do not sync between browsers/devices, discloses ISBN transmission, and explains the cover fallback behavior.
- [ ] **Step 3: Rename the local default branch to `main`** for a straightforward GitHub Pages setup, then commit the README.

## Completion Check

Run `node --test tests/books.test.cjs`, complete the Task 2 browser checks in a temporary local preview, stop the preview, and verify the site has no build/install requirement, no metadata requests, and no bulk cover fetching.
