const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
  // ! take data
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished = readPage === pageCount,
    reading = false
  } = request.payload;
  // ! validation
  if (!name) {
    return h
      .response({
        status: 'fail',
        message: 'Gagal menambahkan buku. Mohon isi nama buku'
      })
      .code(400);
  }
  if (readPage > pageCount) {
    return h
      .response({
        status: 'fail',
        message:
          'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
      })
      .code(400);
  }
  // ! create data
  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt
  };
  books.push(newBook);

  // ! response
  const isSuccess = books.filter((note) => note.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id
      }
    });
    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan'
  });
  response.code(500);
  return response;
};

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  // filter berdasarkan nama jika query parameter name diberikan
  // membuat copy dari books agar tidak merubah data asli
  let filteredBooks = books;

  if (name) {
    filteredBooks = filteredBooks.filter((book) =>
      book.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (reading) {
    filteredBooks = filteredBooks.filter(
      (book) => book.reading === (reading.toLowerCase() === 'true')
    );
  }

  if (finished !== undefined) {
    filteredBooks = filteredBooks.filter(
      (book) => book.finished === (finished === '1')
    );
  }

  const response = h.response({
    status: 'success',
    data: {
      books: filteredBooks.map(({ id, name, publisher }) => ({
        id,
        name,
        publisher
      }))
    }
  });
  response.code(200);
  return response;
};

const getBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const book = books.filter((n) => n.id === id)[0];
  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book
      }
    };
  }
  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan'
  });
  response.code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading
  } = request.payload;

  if (!name) {
    return h
      .response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Mohon isi nama buku'
      })
      .code(400);
  }
  if (readPage > pageCount) {
    return h
      .response({
        status: 'fail',
        message:
          'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'
      })
      .code(400);
  }

  const updatedAt = new Date().toISOString();
  const index = books.findIndex((item) => item.id === id);

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt
    };
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui'
    });
    response.code(200);
    return response;
  }
  // const index = books.findIndex((book) => book.id === id);
  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan'
  });
  response.code(404);
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const index = books.findIndex((note) => note.id === id);
  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus'
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan'
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler
};
