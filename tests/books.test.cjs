const assert = require('node:assert/strict');
const test = require('node:test');

const {
  normalizeIsbn,
  isValidIsbn,
  coverUrlForIsbn,
  createBook,
  filterBooks,
  setBookStatus,
  removeBook,
} = require('../src/books.js');

test('normalizeIsbn_removesSpacesHyphensAndUppercasesX', () => {
  assert.equal(normalizeIsbn(' 0-385 47257 9 '), '0385472579');
  assert.equal(normalizeIsbn('0-8044-2957-x'), '080442957X');
});

test('isValidIsbn_acceptsKnownIsbn10AndIsbn13', () => {
  assert.equal(isValidIsbn('0385472579'), true);
  assert.equal(isValidIsbn('9780385533225'), true);
  assert.equal(isValidIsbn('978-0-385-53322-5'), true);
});

test('isValidIsbn_rejectsBadChecksumsAndLengths', () => {
  assert.equal(isValidIsbn('0385472578'), false);
  assert.equal(isValidIsbn('9780385533226'), false);
  assert.equal(isValidIsbn('123456789'), false);
  assert.equal(isValidIsbn(''), false);
});

test('coverUrlForIsbn_returnsMediumUrlOnlyForValidIsbn', () => {
  assert.equal(
    coverUrlForIsbn('978-0-385-53322-5'),
    'https://covers.openlibrary.org/b/isbn/9780385533225-M.jpg?default=false',
  );
  assert.equal(coverUrlForIsbn('not-an-isbn'), null);
});

test('createBook_keepsBlankOrInvalidIsbnAndStartsWantToRead', () => {
  const withoutIsbn = createBook(
    { title: '  The Left Hand of Darkness  ', author: '  Ursula K. Le Guin  ', language: ' English ', type: 'Fiction' },
    'book-1',
  );
  const withInvalidIsbn = createBook(
    { title: 'A Book', author: '', language: 'Malayalam', type: 'Nonfiction', isbn: 'bad' },
    'book-2',
  );

  assert.deepEqual(withoutIsbn, {
    id: 'book-1',
    title: 'The Left Hand of Darkness',
    author: 'Ursula K. Le Guin',
    language: 'English',
    type: 'Fiction',
    status: 'Want to read',
    isbn: '',
  });
  assert.equal(withInvalidIsbn.isbn, 'bad');
  assert.equal(withInvalidIsbn.status, 'Want to read');
});

test('createBook_rejectsWhitespaceTitle', () => {
  assert.throws(
    () => createBook({ title: '   ', type: 'Fiction' }, 'book-1'),
    /title/i,
  );
});

test('filterBooks_searchesTitleAndAuthorCaseInsensitively', () => {
  const books = [
    { id: '1', title: 'The God of Small Things', author: 'Arundhati Roy', language: 'English', type: 'Fiction', status: 'Finished' },
    { id: '2', title: 'Randamoozham', author: 'M. T. Vasudevan Nair', language: 'Malayalam', type: 'Fiction', status: 'Want to read' },
  ];

  assert.deepEqual(filterBooks(books, { search: 'GOD OF SMALL' }), [books[0]]);
  assert.deepEqual(filterBooks(books, { search: 'vasudevan nair' }), [books[1]]);
});

test('filterBooks_combinesLanguageTypeAndStatus', () => {
  const books = [
    { id: '1', title: 'Book 1', author: 'Author', language: 'Malayalam', type: 'Fiction', status: 'Finished' },
    { id: '2', title: 'Book 2', author: 'Author', language: 'Malayalam', type: 'Fiction', status: 'Want to read' },
    { id: '3', title: 'Book 3', author: 'Author', language: 'English', type: 'Nonfiction', status: 'Finished' },
  ];

  assert.deepEqual(
    filterBooks(books, { language: 'Malayalam', type: 'Fiction', status: 'Finished' }),
    [books[0]],
  );
});

test('setBookStatus_changesOnlyTheRequestedBook', () => {
  const books = [
    { id: '1', status: 'Want to read' },
    { id: '2', status: 'Finished' },
  ];
  const updated = setBookStatus(books, '1', 'Finished');

  assert.deepEqual(updated, [
    { id: '1', status: 'Finished' },
    { id: '2', status: 'Finished' },
  ]);
  assert.equal(books[0].status, 'Want to read');
  assert.equal(updated[1], books[1]);
});

test('removeBook_removesOnlyTheRequestedBook', () => {
  const books = [
    { id: '1', title: 'First' },
    { id: '2', title: 'Second' },
  ];

  assert.deepEqual(removeBook(books, '1'), [books[1]]);
  assert.equal(books.length, 2);
});
