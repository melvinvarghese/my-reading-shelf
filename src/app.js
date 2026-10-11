(() => {
  const {
    createBook,
    coverUrlForIsbn,
    filterBooks,
    isValidIsbn,
    removeBook,
    setBookStatus,
  } = window.ReadingShelfBooks;
  const STORAGE_KEY = 'my-reading-shelf.books.v1';
  const COVER_HISTORY_KEY = 'my-reading-shelf.cover-requests.v1';
  const { reserveCoverRequest } = window.ReadingShelfCoverLimits;
  const form = document.querySelector('#book-form');
  const list = document.querySelector('#book-list');
  const notice = document.querySelector('#notice');
  const search = document.querySelector('#search');
  const languageFilter = document.querySelector('#filter-language');
  const typeFilter = document.querySelector('#filter-type');
  const statusFilter = document.querySelector('#filter-status');
  const emptyState = document.querySelector('#empty-state');
  const noResults = document.querySelector('#no-results');
  const bookCount = document.querySelector('#book-count');
  const rows = new Map();
  let books = [];

  function showNotice(message, kind = 'info') {
    notice.textContent = message;
    notice.dataset.kind = kind;
    notice.hidden = false;
  }

  function readBooks() {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) throw new Error('Saved shelf is not a list.');
      return parsed.filter((book) => book && typeof book.id === 'string' && typeof book.title === 'string');
    } catch {
      showNotice('The saved shelf could not be read. It is starting empty; add a book to save a new list.', 'warning');
      return [];
    }
  }

  function saveBooks() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
      return true;
    } catch {
      showNotice('This browser could not save your shelf. You can keep using it here, but your changes may not stay after closing the page.', 'warning');
      return false;
    }
  }

  function makeCoverPlaceholder(message) {
    const placeholder = document.createElement('span');
    placeholder.className = 'cover-placeholder';
    placeholder.textContent = message;
    return placeholder;
  }

  function reserveCoverLoad() {
    try {
      const saved = window.localStorage.getItem(COVER_HISTORY_KEY);
      const history = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(history)) return false;
      const reservation = reserveCoverRequest(history);
      if (!reservation.allowed) return false;
      window.localStorage.setItem(COVER_HISTORY_KEY, JSON.stringify(reservation.timestamps));
      return true;
    } catch {
      return false;
    }
  }

  function createCover(book) {
    const cover = document.createElement('div');
    cover.className = 'book-cover';

    if (!book.isbn) {
      cover.append(makeCoverPlaceholder('No cover'));
      return cover;
    }

    if (!isValidIsbn(book.isbn)) {
      cover.append(makeCoverPlaceholder('Check ISBN'));
      return cover;
    }

    if (!reserveCoverLoad()) {
      cover.append(makeCoverPlaceholder('Cover skipped for now'));
      return cover;
    }

    const image = document.createElement('img');
    image.src = coverUrlForIsbn(book.isbn);
    image.alt = `Cover of ${book.title}`;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.referrerPolicy = 'no-referrer';
    image.addEventListener('error', () => {
      image.replaceWith(makeCoverPlaceholder('Cover not available'));
    }, { once: true });
    cover.append(image);
    return cover;
  }

  function createTextElement(tagName, className, text) {
    const element = document.createElement(tagName);
    element.className = className;
    element.textContent = text;
    return element;
  }

  function createBookRow(book) {
    const row = document.createElement('li');
    row.className = 'book-row';
    row.dataset.bookId = book.id;
    row.append(createCover(book));

    const detail = document.createElement('div');
    detail.className = 'book-detail';
    detail.append(createTextElement('h3', 'book-title', book.title));
    if (book.author) detail.append(createTextElement('p', 'book-author', book.author));

    const metadata = document.createElement('div');
    metadata.className = 'book-metadata';
    if (book.language) metadata.append(createTextElement('span', 'book-language', book.language));
    if (book.type) metadata.append(createTextElement('span', 'book-type', book.type));
    detail.append(metadata);

    const controls = document.createElement('div');
    controls.className = 'book-controls';
    const status = document.createElement('select');
    status.className = 'status-select';
    status.setAttribute('aria-label', `Reading status for ${book.title}`);
    for (const value of ['Want to read', 'Finished']) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      status.append(option);
    }
    status.value = book.status;
    status.addEventListener('change', () => {
      books = setBookStatus(books, book.id, status.value);
      saveBooks();
      updateFiltersAndRows();
      if (!notice.dataset.kind || notice.dataset.kind !== 'warning') showNotice('Reading status updated.');
    });
    controls.append(status);

    const remove = document.createElement('button');
    remove.className = 'remove-book';
    remove.type = 'button';
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', `Remove ${book.title}`);
    remove.addEventListener('click', () => {
      books = removeBook(books, book.id);
      rows.get(book.id)?.remove();
      rows.delete(book.id);
      refreshLanguageFilter();
      saveBooks();
      updateFiltersAndRows();
      if (!notice.dataset.kind || notice.dataset.kind !== 'warning') showNotice('Book removed from your shelf.');
    });
    controls.append(remove);
    row.append(detail, controls);
    return row;
  }

  function addBookRow(book) {
    const row = createBookRow(book);
    rows.set(book.id, row);
    list.append(row);
  }

  function refreshLanguageFilter() {
    const current = languageFilter.value;
    const languages = [...new Set(books.map((book) => book.language).filter(Boolean))]
      .sort((first, second) => first.localeCompare(second));
    const allLanguages = document.createElement('option');
    allLanguages.value = '';
    allLanguages.textContent = 'All languages';
    languageFilter.replaceChildren(allLanguages);
    for (const language of languages) {
      const option = document.createElement('option');
      option.value = language;
      option.textContent = language;
      languageFilter.append(option);
    }
    languageFilter.value = languages.includes(current) ? current : '';
  }

  function updateFiltersAndRows() {
    const visibleIds = new Set(filterBooks(books, {
      search: search.value,
      language: languageFilter.value,
      type: typeFilter.value,
      status: statusFilter.value,
    }).map((book) => book.id));
    for (const [id, row] of rows) row.hidden = !visibleIds.has(id);

    const visibleCount = visibleIds.size;
    emptyState.hidden = books.length > 0;
    noResults.hidden = books.length === 0 || visibleCount > 0;
    bookCount.textContent = `${books.length} ${books.length === 1 ? 'book' : 'books'}`;
  }

  function newBookId() {
    return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `book-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function resetFilters() {
    search.value = '';
    languageFilter.value = '';
    typeFilter.value = '';
    statusFilter.value = '';
  }

  for (const book of (books = readBooks())) addBookRow(book);
  refreshLanguageFilter();
  updateFiltersAndRows();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    try {
      const data = new FormData(form);
      const book = createBook({
        title: data.get('title'),
        author: data.get('author'),
        language: data.get('language'),
        type: data.get('type'),
        isbn: data.get('isbn'),
      }, newBookId());
      books = [...books, book];
      addBookRow(book);
      refreshLanguageFilter();
      resetFilters();
      updateFiltersAndRows();
      form.reset();

      const saved = saveBooks();
      if (saved) {
        const coverMessage = book.isbn && !isValidIsbn(book.isbn)
          ? ' ISBN is not valid, so no cover was requested.'
          : '';
        showNotice(`Book added to this browser's shelf.${coverMessage}`);
      }
    } catch (error) {
      showNotice(error.message || 'The book could not be added.', 'warning');
    }
  });

  for (const control of [search, languageFilter, typeFilter, statusFilter]) {
    control.addEventListener('input', updateFiltersAndRows);
    control.addEventListener('change', updateFiltersAndRows);
  }
  document.querySelector('#reset-filters').addEventListener('click', () => {
    resetFilters();
    updateFiltersAndRows();
  });
})();
