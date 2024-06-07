// server.ts
import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

// Create Author
app.get('/', async (req, res) => {
  res.json("Server is on");
});

app.post('/author', async (req, res) => {
    console.log("req.body==>",req.body)
  const { name } = req.body;
  const author = await prisma.author.create({ data: { name } });
  res.json(author);
});

// Create Genre
app.post('/genre', async (req, res) => {
  const { name } = req.body;
  const genre = await prisma.genre.create({ data: { name } });
  res.json(genre);
});

// Create Book
app.post('/book', async (req, res) => {
  const { title, authorId, genreIds } = req.body;
  const book = await prisma.book.create({
    data: {
      title,
      authorId,
      bookGenres: {
        create: genreIds.map((genreId: string) => ({
          genre: { connect: { id: genreId } },
        })),
      },
    },
  });
  res.json(book);
});

// List Books by Author
app.get('/books/author/:authorId', async (req, res) => {
  const { authorId } = req.params;
  const books = await prisma.book.findMany({
    where: { authorId },
    include: { author: true, bookGenres: { include: { genre: true } } },
  });
  res.json(books);
});

// List Books by Genre
app.get('/books/genre/:genreId', async (req, res) => {
  const { genreId } = req.params;
  const bookGenres = await prisma.bookGenre.findMany({
    where: { genreId },
    include: { book: { include: { author: true, bookGenres: { include: { genre: true } } } } },
  });
  const books = bookGenres.map(bg => bg.book);
  res.json(books);
});

// Fetch Single Book with Details
app.get('/book/:id', async (req, res) => {
  const { id } = req.params;
  const book = await prisma.book.findUnique({
    where: { id },
    include: { author: true, bookGenres: { include: { genre: true } } },
  });
  if (book) {
    const genreDetails = await Promise.all(book.bookGenres.map(async (bg) => ({
      name: bg.genre.name,
      totalBooks: await prisma.bookGenre.count({ where: { genreId: bg.genreId } })
    })));
    res.json({ ...book, genreDetails });
  } else {
    res.status(404).json({ error: 'Book not found' });
  }
});

// Delete a Book
app.delete('/book/:id', async (req, res) => {
  const { id } = req.params;
  const book = await prisma.book.delete({ where: { id } });
  res.json(book);
});

app.listen(3001, () =>
  console.log('Server running on http://localhost:3000')
);
