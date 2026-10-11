# My Reading Shelf — Design Specification

**Date:** 2026-10-11

**Status:** Revised for ISBN-based covers; awaiting user review

## Purpose

A small, beginner-friendly portfolio project: a personal list of books someone has
finished or wants to read. It should be easy to run locally and publish as a static
GitHub Pages site.

## Scope

- Add a book with a required title, optional author, language, Fiction or Nonfiction
  type, and an optional ISBN.
- Mark each book **Want to read** or **Finished**; allow removing an entry.
- Search titles and authors; filter by language, type, and reading status.
- Save book details in browser `localStorage` on the current device only.
- When an ISBN is valid, display its book cover from the Open Library Covers API.
- Provide a responsive, accessible interface and a plain-language README.

No account, app server, sync, cover crawling or bulk download, metadata lookup,
framework, or package dependency. The Open Library image URL is the only external
runtime request.

## Approach

Use plain HTML, CSS, and JavaScript. Keep the project small and suitable for
GitHub Pages; the site runs without a build step. Each book object stores an id,
title, author, language, type, status, and optional ISBN. Book details stay in
local storage. For a valid ISBN, display a lazy-loaded image from
`https://covers.openlibrary.org/b/isbn/{ISBN}-M.jpg?default=false`; do not fetch
book metadata or initiate background/bulk cover requests. Reuse existing cover
image elements when search, filters, or status changes update the shelf, avoiding
unnecessary repeat requests. The ISBN is included in the public image URL, so Open
Library receives that ISBN when its cover is loaded.

Normalize ISBN input by removing spaces and hyphens and uppercasing a final `X`.
Accept valid ISBN-10 and ISBN-13 values only, including their check digit. An empty
ISBN makes no request. A non-empty invalid ISBN does not block saving the book and
shows a clear placeholder instead of requesting a cover. If a valid ISBN has no
cover (the API returns 404) or the image fails to load, show a clear “Cover not
available” placeholder; the rest of the shelf remains usable. Do not retry on
failure. Load images lazily and make only the individual cover requests needed to
display books the user has added; respect Open Library's stated limit of 100
requests per IP per 5 minutes. Include a courtesy link to Open Library in the
page footer.

Render all user-entered text as text (not HTML). If a title is blank, show a
clear validation message. If the browser cannot save to local storage, explain
that entries may not persist.

## Interface direction

A tidy personal-library look, not a generic dashboard: cool pale-blue paper,
charcoal-blue ink, muted teal for reading states, and a small golden bookmark
accent. Use a literary serif for the main title and familiar sans-serif text for
controls. Keep the page left-aligned, with a short introduction and book-entry
form beside the shelf on wide screens; stack them on small screens. Books appear
as simple, color-accented rows with a small cover thumbnail or a same-sized
textual placeholder. The empty state tells the visitor how to add a first book.
The cover credit sits quietly in the footer.

**Palette:** Paper `#EEF4F6`, ink `#172E3A`, muted text `#52656D`, shelf teal
`#276B67`, bookmark gold `#E3B94F`.

## Data and behavior

The form adds a new book with the initial status **Want to read**. Each shelf row
can change its status or remove just that entry. Search matches title and author
without regard to letter case. Filters combine, and a reset option returns to the
full shelf. Language values are entered as short text so books in any language
can be represented; the language filter is populated from languages already on
this shelf. A blank or invalid ISBN never prevents adding or using a book. Only a
valid ISBN requests one lazy-loaded medium cover image; blank, invalid, missing,
or failed covers use a readable placeholder. An empty shelf displays guidance
instead of a blank list.

## Verification

- Test book creation, ISBN-10/ISBN-13 validation and normalization, invalid and
  blank ISBN behavior, filtering, status changes, and removal with Node's built-in
  test runner.
- Manually verify adding a book with no ISBN, a valid ISBN with a cover, an invalid
  ISBN, and a valid ISBN whose cover cannot load; confirm failures leave the shelf
  usable and no requests occur for blank/invalid ISBNs.
- Manually verify search, combined filters, persistence after reload, and a
  narrow/mobile layout in a browser.
- Confirm cover requests are limited to individual valid ISBNs entered by the
  user, use lazy loading, never bulk-fetch, and include a courtesy Open Library
  link.
- Confirm the site needs no server, build step, or installed package to run.

## Deliverables

A standalone `my-reading-shelf` project folder with source files, automated logic
tests, and a beginner README that explains how to open it, how covers are loaded,
the local-only data limitation, and how to publish it with GitHub Pages. The
revised specification remains in `docs/` during development.

## Reference

[Open Library Covers API documentation](https://openlibrary.org/dev/docs/api/covers)
(updated 2024-08-13). It documents ISBN-based cover image URLs, the
`?default=false` missing-cover response, a 100-requests-per-IP-per-5-minutes
limit for ISBN lookups, and the recommendation to link back to Open Library.
