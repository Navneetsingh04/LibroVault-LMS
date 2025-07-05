import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { Borrow } from "../models/borrowModel.js";
import { Book } from "../models/bookModel.js";
import { User } from "../models/userModel.js";
import { calcualteFine } from "../utils/fineCalculator.js";

export const recordBorrowedBook = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { email } = req.body;

  const [book, user] = await Promise.all([
    Book.findById(id),
    User.findOne({ email }),
  ]);

  if (!book) return next(new ErrorHandler("Book not found", 404));

  if (!user) return next(new ErrorHandler("User Not Found", 404));

  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  if (book.quantity === 0) {
    return next(new ErrorHandler("Book is Not available", 400));
  }

  const isAlreadyBorrowed = user.borrowedBooks.find(
    (b) => b.bookId.toString() === id && b.returned === false
  );

  if (isAlreadyBorrowed) {
    return next(new ErrorHandler("Book is already borrowed", 400));
  }
  book.quantity -= 1;
  book.availability = book.quantity > 0;
  await book.save();

  user.borrowedBooks.push({
    bookId: book._id,
    bookTitle: book.title,
    borrowedDate: new Date(),
    dueDate: dueDate,
  });

  await user.save();
  await Borrow.create({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    book: book._id,
    dueDate: dueDate,
    price: book.price,
  });
  res.status(200).json({
    success: true,
    message: "Book borrowed successfully",
  });
});

export const returnBorrowedBook = catchAsyncErrors(async (req, res, next) => {
  const { bookId } = req.params;
  const { email } = req.body;

  const [book, user] = await Promise.all([
    Book.findById(bookId),
    User.findOne({ email: email.trim() }),
  ]);

  if (!book) return next(new ErrorHandler("Book not found", 404));

  if (!user) return next(new ErrorHandler("User Not Found", 404));

  const borrowedBook = user.borrowedBooks.find(
    (b) => b.bookId.toString() === bookId && b.returned === false
  );
  if (!borrowedBook) {
    return next(new ErrorHandler("Book is not borrowed", 400));
  }
  borrowedBook.returned = true;
  await user.save();

  book.quantity += 1;
  book.availability = book.quantity > 0;
  await book.save();

  const borrow = await Borrow.findOne({
    book: bookId,
    "user.email": email,
    returnDate: null,
  });
  if (!borrow) {
    return next(new ErrorHandler("Book is not borrowed", 400));
  }
  borrow.returnDate = new Date();

  const fine = calcualteFine(borrow.dueDate);
  borrow.fine = fine;
  await borrow.save();

  const message =
    fine !== 0
      ? `Book returned successfully. The total charges, including fine, are ₹${
          fine + book.price
        }`
      : `Book returned successfully. The total charges are ₹${book.price}`;

  res.status(200).json({
    success: true,
    message,
  });
});

export const borrowedBooks = catchAsyncErrors(async (req, res, next) => {
  const { borrowedBooks } = req.user;
  res.status(200).json({
    success: true,
    borrowedBooks,
  });
});

export const getBorrowedBookForAdmin = catchAsyncErrors(
  async (req, res, next) => {
    const borrowedBooks = await Borrow.find().lean();
    res.status(200).json({
      success: true,
      borrowedBooks,
    });
  }
);
