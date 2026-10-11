const COVER_BASE = 'https://covers.openlibrary.org/b/isbn/';

function normalizeIsbn(value) {
  const isbn = String(value ?? '').trim().replace(/[\s-]/g, '');
  return isbn.replace(/x$/i, 'X');
}

function isValidIsbn(value) {
  const isbn = normalizeIsbn(value);

  if (/^\d{9}[\dX]$/.test(isbn)) {
    const sum = [...isbn].reduce((total, character, index) => {
      const digit = character === 'X' ? 10 : Number(character);
      return total + digit * (10 - index);
    }, 0);
    return sum % 11 === 0;
  }

  if (/^(978|979)\d{10}$/.test(isbn)) {
    const sum = [...isbn.slice(0, 12)].reduce(
      (total, character, index) => total + Number(character) * (index % 2 === 0 ? 1 : 3),
      0,
    );
    return (10 - (sum % 10)) % 10 === Number(isbn[12]);
  }

  return false;
}

function coverUrlForIsbn(value) {
  const isbn = normalizeIsbn(value);
  if (!isValidIsbn(isbn)) return null;
  return `${COVER_BASE}${isbn}-M.jpg?default=false`;
}

function createBook(input, id) {
  const title = String(input?.title ?? '').trim();
  if (!title) throw new Error('Title is required.');

  return {
    id,
    title,
    author: String(input.author ?? '').trim(),
    language: String(input.language ?? '').trim(),
    type: String(input.type ?? '').trim(),
    status: 'Want to read',
    isbn: normalizeIsbn(input.isbn),
  };
}

function filterBooks(books, filters = {}) {
  const search = String(filters.search ?? '').trim().toLocaleLowerCase();
  const language = String(filters.language ?? '');
  const type = String(filters.type ?? '');
  const status = String(filters.status ?? '');

  return books.filter((book) => {
    const searchableText = `${book.title} ${book.author}`.toLocaleLowerCase();
    return (
      (!search || searchableText.includes(search)) &&
      (!language || book.language === language) &&
      (!type || book.type === type) &&
      (!status || book.status === status)
    );
  });
}

function setBookStatus(books, id, status) {
  return books.map((book) => (book.id === id ? { ...book, status } : book));
}

function removeBook(books, id) {
  return books.filter((book) => book.id !== id);
}

const ReadingShelfBooks = {
  normalizeIsbn,
  isValidIsbn,
  coverUrlForIsbn,
  createBook,
  filterBooks,
  setBookStatus,
  removeBook,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReadingShelfBooks;
}

if (typeof window !== 'undefined') {
  window.ReadingShelfBooks = ReadingShelfBooks;
}
