import React, { useEffect, useState } from "react";
import { PiKeyReturnBold } from "react-icons/pi";
import { FaSquareCheck } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { toggleReturnBookPopup } from "../store/slices/popUpSlice";
import { toast } from "react-toastify";
import Header from "../layout/Header";
import {
  fetchAllBorrowedBooks,
  fetchUserBorrowedBooks,
  resetBorrowSlice,
} from "../store/slices/borrowSlice";
import { resetBookSlice } from "../store/slices/bookSlice";
import ReturnBookPopup from "../popups/ReturnBookPopup";

const Catalog = () => {
  const dispatch = useDispatch();
  const { returnBookPopup } = useSelector((state) => state.popup);
  const { loading, error, message, allBorrowedBooks } = useSelector(
    (state) => state.borrow
  );
  const [filter, setFilter] = useState("borrowed");

  const formatDateAndTime = (timeStamp) => {
    const date = new Date(timeStamp);
    const formattedDate = `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
    const formattedTime = `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
    return `${formattedDate} ${formattedTime}`;
  };
  const formatDate = (timeStamp) => {
    const date = new Date(timeStamp);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
  };

  const currentDate = new Date();
  const borrowedBooks = allBorrowedBooks?.filter((book) => {
    const dueDate = new Date(book.dueDate);
    return dueDate >= currentDate;
  });
  const overdueBooks = allBorrowedBooks?.filter((book) => {
    const dueDate = new Date(book.dueDate);
    return dueDate <= currentDate;
  });

  const booksToDisplay = filter === "borrowed" ? borrowedBooks : overdueBooks;

  const [email, setEmail] = useState("");
  const [borrowedBookId, setBorrowedBookId] = useState("");

  const openReturnBookPopup = (bookId, email) => {
    setBorrowedBookId(bookId);
    setEmail(email);
    dispatch(toggleReturnBookPopup());
  };

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(fetchAllBorrowedBooks());
      dispatch(fetchUserBorrowedBooks());
      dispatch(resetBorrowSlice());
      dispatch(resetBookSlice());
    }
    if (error) {
      toast.error(error);
      dispatch(resetBorrowSlice());
    }
  }, [dispatch, error, loading]);

  return (
    <>
      <main className="relative flex-1 p-4 sm:p-6 pt-24 sm:pt-28">
        <Header />
        
        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-xl font-medium md:text-2xl md:font-semibold">
            Borrowed Books Catalog
          </h2>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 mb-6">
          <button
            className={`relative rounded-lg sm:rounded-tr-none sm:rounded-br-none text-center border-2 font-semibold py-3 px-4 w-full sm:w-auto sm:min-w-48 transition-colors ${
              filter === "borrowed"
                ? "bg-black text-white border-black"
                : "bg-gray-200 text-black border-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => setFilter("borrowed")}
          >
            Borrowed Books
          </button>
          <button
            className={`relative rounded-lg sm:rounded-tl-none sm:rounded-bl-none text-center border-2 font-semibold py-3 px-4 w-full sm:w-auto sm:min-w-48 transition-colors ${
              filter === "overdue"
                ? "bg-black text-white border-black"
                : "bg-gray-200 text-black border-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => setFilter("overdue")}
          >
            Overdue Borrowers
          </button>
        </div>

        {/* Books Display */}
        {booksToDisplay && booksToDisplay.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-auto bg-white rounded-md shadow-lg">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Username</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Price</th>
                    <th className="px-4 py-3 text-left">Due Date</th>
                    <th className="px-4 py-3 text-left">Date & Time</th>
                    <th className="px-4 py-3 text-center">Return</th>
                  </tr>
                </thead>
                <tbody>
                  {booksToDisplay.map((book, index) => (
                    <tr
                      key={book._id}
                      className={(index + 1) % 2 === 0 ? "bg-gray-50" : ""}
                    >
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3">{book?.user.name}</td>
                      <td className="px-4 py-3">{book?.user.email}</td>
                      <td className="px-4 py-3">₹ {book?.title}</td>
                      <td className="px-4 py-3">{formatDate(book.dueDate)}</td>
                      <td className="px-4 py-3">{formatDateAndTime(book.createdAt)}</td>
                      <td className="px-4 py-3 text-center">
                        {book.returnDate ? (
                          <FaSquareCheck className="text-green-500 text-2xl mx-auto" />
                        ) : (
                          <PiKeyReturnBold
                            className="text-red-500 text-2xl cursor-pointer hover:text-red-700 mx-auto"
                            onClick={() => openReturnBookPopup(book.book, book?.user.email)}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {booksToDisplay.map((book, index) => (
                <div
                  key={book._id}
                  className="bg-white rounded-lg shadow-lg p-4 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {book?.user.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {book?.user.email}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {book.returnDate ? (
                        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                          <FaSquareCheck className="text-green-500" />
                          <span className="text-xs font-medium">Returned</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => openReturnBookPopup(book.book, book?.user.email)}
                          className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full hover:bg-red-200 transition-colors"
                        >
                          <PiKeyReturnBold className="text-red-500" />
                          <span className="text-xs font-medium">Return</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Price:</span>
                      <span className="font-medium">₹ {book?.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Due Date:</span>
                      <span className={`font-medium ${
                        new Date(book.dueDate) <= new Date() 
                          ? "text-red-600" 
                          : "text-gray-900"
                      }`}>
                        {formatDate(book.dueDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Borrowed On:</span>
                      <span className="font-medium text-right">
                        {formatDateAndTime(book.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Status indicator for overdue books */}
                  {new Date(book.dueDate) <= new Date() && !book.returnDate && (
                    <div className="mt-3 p-2 bg-red-50 border-l-4 border-red-400 rounded">
                      <p className="text-red-700 text-xs font-medium">
                        ⚠️ This book is overdue
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-32 sm:h-48">
            <h3 className="text-center font-medium text-lg sm:text-xl md:text-3xl text-gray-500 px-4">
              No {filter === "borrowed" ? "Borrowed" : "Overdue"} Books found in library
            </h3>
          </div>
        )}
      </main>

      {/* Read Book Popup */}
      {returnBookPopup && <ReturnBookPopup bookId={borrowedBookId} email={email} />}
    </>
  );
};

export default Catalog;
