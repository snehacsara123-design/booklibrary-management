import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { resolve } from 'node:path';
import Book from '../models/Book.js';
import User from '../models/User.js';

dotenv.config();
if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
  dotenv.config({ path: resolve(process.cwd(), 'backend', '.env') });
}

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!mongoUri) {
  console.error('Missing MONGODB_URI (or MONGO_URI). Add it to the project .env before seeding.');
  process.exit(1);
}

const adminPassword = process.env.SEED_ADMIN_PASSWORD;
const studentPassword = process.env.SEED_STUDENT_PASSWORD;
const seedUsers = Boolean(adminPassword && studentPassword);
if (Boolean(adminPassword) !== Boolean(studentPassword)) {
  console.error('Set both SEED_ADMIN_PASSWORD and SEED_STUDENT_PASSWORD, or leave both unset to seed books only.');
  process.exit(1);
}
if (seedUsers && (adminPassword.length < 12 || studentPassword.length < 12)) {
  console.error('Seed passwords must each be at least 12 characters long.');
  process.exit(1);
}

const users = [
  {
    name: 'Library Administrator',
    email: (process.env.SEED_ADMIN_EMAIL || 'admin@library.local').toLowerCase(),
    password: adminPassword,
    role: 'admin',
    studentId: '',
    phone: '',
  },
  {
    name: 'Sample Student',
    email: (process.env.SEED_STUDENT_EMAIL || 'student@library.local').toLowerCase(),
    password: studentPassword,
    role: 'student',
    studentId: 'STU-1001',
    phone: '',
  },
];

const books = [
  { title: 'The Pragmatic Programmer', author: 'David Thomas and Andrew Hunt', category: 'Technology', isbn: '9780135957059', description: 'Practical guidance for building better software and developing as a programmer.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg', shelfLocation: 'T-01', totalCopies: 5, availableCopies: 5 },
  { title: 'Clean Code', author: 'Robert C. Martin', category: 'Technology', isbn: '9780132350884', description: 'A guide to writing readable, maintainable software.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg', shelfLocation: 'T-02', totalCopies: 4, availableCopies: 4 },
  { title: 'Atomic Habits', author: 'James Clear', category: 'Personal Development', isbn: '9780735211292', description: 'A practical framework for building good habits and breaking bad ones.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg', shelfLocation: 'P-01', totalCopies: 6, availableCopies: 6 },
  { title: 'Educated', author: 'Tara Westover', category: 'Biography', isbn: '9780399590504', description: 'A memoir about education, family, and finding a path of one’s own.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780399590504-L.jpg', shelfLocation: 'B-04', totalCopies: 3, availableCopies: 3 },
  { title: 'The Hobbit', author: 'J. R. R. Tolkien', category: 'Fantasy', isbn: '9780547928227', description: 'A classic adventure through Middle-earth.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg', shelfLocation: 'F-02', totalCopies: 4, availableCopies: 4 },
  { title: 'Sapiens', author: 'Yuval Noah Harari', category: 'History', isbn: '9780062316097', description: 'A broad history of humankind, from early humans to the modern era.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg', shelfLocation: 'H-01', totalCopies: 3, availableCopies: 3 },
  { title: 'The Alchemist', author: 'Paulo Coelho', category: 'Fiction', isbn: '9780061122415', description: 'A fable about following a journey and listening to one’s heart.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780061122415-L.jpg', shelfLocation: 'F-01', totalCopies: 5, availableCopies: 5 },
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'Psychology', isbn: '9780374533557', description: 'An exploration of the two systems that shape the way people think.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg', shelfLocation: 'P-03', totalCopies: 2, availableCopies: 2 },
  { title: 'Pride and Prejudice', author: 'Jane Austen', category: 'Classic Fiction', isbn: '9780141439518', description: 'A lively story of first impressions, family, and changing affection.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg', shelfLocation: 'C-01', totalCopies: 4, availableCopies: 4 },
  { title: '1984', author: 'George Orwell', category: 'Science Fiction', isbn: '9780451524935', description: 'A landmark dystopian novel about surveillance and individual freedom.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg', shelfLocation: 'S-01', totalCopies: 5, availableCopies: 5 },
  { title: 'Dune', author: 'Frank Herbert', category: 'Science Fiction', isbn: '9780441172719', description: 'A sweeping story of politics, ecology, and survival on a desert world.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg', shelfLocation: 'S-02', totalCopies: 3, availableCopies: 3 },
  { title: 'The Book Thief', author: 'Markus Zusak', category: 'Historical Fiction', isbn: '9780375842207', description: 'A young reader discovers the power of words in wartime Germany.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780375842207-L.jpg', shelfLocation: 'H-02', totalCopies: 3, availableCopies: 3 },
  { title: 'The Little Prince', author: 'Antoine de Saint-Exupery', category: 'Children', isbn: '9780156012195', description: 'A poetic tale about friendship, curiosity, and seeing with the heart.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780156012195-L.jpg', shelfLocation: 'K-01', totalCopies: 4, availableCopies: 4 },
  { title: 'The Design of Everyday Things', author: 'Don Norman', category: 'Design', isbn: '9780465050659', description: 'A clear introduction to designing useful, understandable products.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780465050659-L.jpg', shelfLocation: 'D-01', totalCopies: 2, availableCopies: 2 },
  { title: 'The Immortal Life of Henrietta Lacks', author: 'Rebecca Skloot', category: 'Science', isbn: '9781400052189', description: 'The story of the woman behind a cell line that transformed modern medicine.', coverImage: 'https://covers.openlibrary.org/b/isbn/9781400052189-L.jpg', shelfLocation: 'N-01', totalCopies: 2, availableCopies: 2 },
  { title: 'The Namesake', author: 'Jhumpa Lahiri', category: 'Literary Fiction', isbn: '9780618485222', description: 'A family story about identity, belonging, and life between cultures.', coverImage: 'https://covers.openlibrary.org/b/isbn/9780618485222-L.jpg', shelfLocation: 'F-03', totalCopies: 3, availableCopies: 3 },
];

async function seed() {
  try {
    await mongoose.connect(mongoUri);
    if (seedUsers) {
      for (const user of users) {
        const passwordHash = await bcrypt.hash(user.password, 12);
        await User.updateOne(
          { email: user.email },
          { $setOnInsert: { ...user, password: passwordHash } },
          { upsert: true, runValidators: true },
        );
      }
    }

    for (const book of books) {
      await Book.updateOne(
        { isbn: book.isbn },
        { $setOnInsert: book },
        { upsert: true, runValidators: true },
      );
    }
    console.log(`Seed complete: ${seedUsers ? `${users.length} sample accounts and ` : ''}${books.length} sample books ensured.`);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

await seed();
