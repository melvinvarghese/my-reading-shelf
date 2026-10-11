# My Reading Shelf

A small personal shelf for books you want to read and books you have finished.
Add a title, choose its language and type, and use an ISBN to look for a cover.

## Try it on your computer

1. Open the project folder.
2. Double-click `index.html` to open the page in your browser.
3. Add a book using the form.

No installation, account, or app server is needed. The page also works on a phone
in its web browser.

## Your list and privacy

Your books are saved in the browser on the device where you entered them. They do
not sync to another phone or computer. If you clear that browser's saved site data,
the list may be removed. This is a personal project, not a secure backup.

When you enter a valid ISBN, the page asks Open Library for that book's cover image.
The ISBN is part of the image address, so Open Library receives it when the cover
loads. Book titles, authors, language, reading status, and your full list stay in
your browser. No cover is requested for a blank or invalid ISBN. If a cover is
missing or cannot load, a placeholder appears and the rest of the shelf still
works.

This page loads covers only for individual books you add; it does not crawl or
bulk-download covers. A small browser-local limit skips extra cover requests after
90 attempts in five minutes. This is a best-effort limit for this browser; it
cannot coordinate other browsers or apps that may share your internet connection.

## Test the book and ISBN rules

Node.js is needed only to run the tests. From this project folder, open a terminal
and run:

```bash
node --test tests/*.test.cjs
```

## Publish the code to GitHub

GitHub Desktop can publish the project without typing Git commands.

1. Extract the project folder onto your computer.
2. Install GitHub Desktop and sign in to your GitHub account.
3. In GitHub Desktop, choose **File → Add Local Repository**, then select the
   `my-reading-shelf` folder.
4. Choose **Publish repository**. Enter a repository name and choose whether it
   should be public or private, then publish it to your GitHub account.

GitHub's [guide to adding an existing project](https://docs.github.com/en/desktop/adding-and-cloning-repositories/adding-an-existing-project-to-github-using-github-desktop)
shows these steps with screenshots.

## Optional: show the website with GitHub Pages

The app does not need to stay online on your computer. If you want a shareable web
address, GitHub Pages can host these static files.

1. Open the repository on GitHub, then choose **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Choose the `main` branch and the `/ (root)` folder, then select **Save**.
4. Wait for GitHub to show the website address on the Pages settings page.

See GitHub's [publishing-source guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
for current screenshots. A Pages website is publicly viewable by anyone with its
address, so do not use it for confidential information. This app keeps its book
list in each visitor's own browser; it does not publish that list to GitHub.

## Book cover source

Covers are displayed directly from [Open Library](https://openlibrary.org/) using
its [Covers API](https://openlibrary.org/dev/docs/api/covers). Open Library asks
sites to link back to it, so the page includes a courtesy link in the footer.
