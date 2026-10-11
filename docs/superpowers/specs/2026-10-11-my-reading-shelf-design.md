# My Reading Shelf — Design Specification

**Date:** 2026-10-11
**Status:** Design direction approved; awaiting specification review

## Purpose

A small, beginner-friendly portfolio project: a personal list of books someone has
finished or wants to read. It should be easy to run locally and publish as a static
GitHub Pages site.

## Scope

- Add a book with a required title, optional author, language, and Fiction or
  Nonfiction type.
- Mark each book **Want to read** or **Finished**; allow removing an entry.
- Search titles and authors; filter by language, type, and reading status.
- Save entries in browser `localStorage` on the current device only.
- Provide a responsive, accessible interface and a plain-language README.

No account, server, sync, external API, framework, or package dependency.

## Approach

Use plain HTML, CSS, and JavaScript. Keep the project small and suitable for
GitHub Pages; the site runs without a build step. Store each book as a small object
with an id, title, author, language, type, and status. Render user-entered text as
text (not HTML). If a title is blank, show a clear validation message. If the
browser cannot save to local storage, explain that entries may not persist.

## Interface direction

A tidy personal-library look, not a generic dashboard: cool pale-blue paper,
charcoal-blue ink, muted teal for reading states, and a small golden bookmark
accent. Use a literary serif for the main title and familiar sans-serif text for
controls. Keep the page left-aligned, with a short introduction and book-entry
form beside the shelf on wide screens; stack them on small screens. Books appear
as simple, color-accented rows rather than repeated dashboard cards. The empty
state tells the visitor how to add a first book.

**Palette:** Paper `#EEF4F6`, ink `#172E3A`, muted text `#52656D`, shelf teal
`#276B67`, bookmark gold `#E3B94F`.

## Data and behavior

The form adds a new book with the initial status **Want to read**. Each shelf row
can change its status or remove just that entry. Search matches title and author
without regard to letter case. Filters combine, and a reset option returns to the
full shelf. Language values are entered as short text so books in any language
can be represented; the language filter is populated from languages already on
this shelf. An empty shelf displays guidance instead of a blank list.

## Verification

- Test the small, dependency-free book filtering/validation logic with Node's
  built-in test runner.
- Manually verify adding a book, status changes, removal, search, combined
  filters, persistence after reload, and a narrow/mobile layout in a browser.
- Confirm there are no external runtime services or required build/install steps.

## Deliverables

A standalone `my-reading-shelf` project folder with source files, the automated
logic test, and a beginner README that explains how to open it and publish it
with GitHub Pages. The design specification remains in `docs/` during development.
