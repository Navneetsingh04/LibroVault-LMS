import React, { useState } from "react";
import { BookA } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleReadBookPopup } from "../store/slices/popUpSlice";
import Header from "../layout/Header";
import ReadBookPopup from "../popups/ReadBookPopup";

const MyBorrowedBooks = () => {
  const dispatch = useDispatch();
  const { userBorrowedBooks } = useSelector((state) => state.borrow);
  const { books } = useSelector((state) => state.book);
  const { readBookPopup } = useSelector((state) => state.popup);

  const [readBook, setReadBook] = useState({});
  
  const openReadBookPopup = (id) => {
    const book = books.find((book) => book._id === id);
    if (book) {
      setReadBook(book);
    }
    dispatch(toggleReadBookPopup());
  };

  const formatDate = (timeStamp) => {
    const date = new Date(timeStamp);
    const formattedDate = `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
    const formattedTime = `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
    return `${formattedDate} ${formattedTime}`;
  };

  const [filter, setFilter] = useState("returned");

  const returnedBooks = userBorrowedBooks?.filter(
    (book) => book.returned === true
  );
  const notReturnedBooks = userBorrowedBooks?.filter(
    (book) => book.returned === false
  );

  const bookToDisplay =
    filter === "returned" ? returnedBooks : notReturnedBooks;

  return (
    <>
      <main className="relative flex-1 p-4 sm:p-6 pt-24 sm:pt-28">
        <Header />

        {/* Sub header */}
        <header className="mb-6">
          <h2 className="text-xl font-medium md:text-2xl md:font-semibold">
            My Borrowed Books
          </h2>
        </header>

        {/* Filter buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 mb-6">
          <button
            className={`relative rounded-lg sm:rounded-tr-none sm:rounded-br-none text-center border-2 font-semibold py-3 px-4 w-full sm:w-auto sm:min-w-48 transition-colors ${
              filter === "returned"
                ? "bg-black text-white border-black"
                : "bg-gray-200 text-black border-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => setFilter("returned")}
          >
            Returned Books
          </button>
          <button
            className={`relative rounded-lg sm:rounded-tl-none sm:rounded-bl-none text-center border-2 font-semibold py-3 px-4 w-full sm:w-auto sm:min-w-48 transition-colors ${
              filter === "notReturned"
                ? "bg-black text-white border-black"
                : "bg-gray-200 text-black border-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => setFilter("notReturned")}
          >
            Non-Returned Books
          </button>
        </div>

        {/* Books Display */}
        {bookToDisplay && bookToDisplay.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-auto bg-white rounded-md shadow-lg">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Book Title</th>
                    <th className="px-4 py-3 text-left">Borrowed Date</th>
                    <th className="px-4 py-3 text-left">Due Date</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-center">View</th>
                  </tr>
                </thead>
                <tbody>
                  {bookToDisplay.map((book, index) => (
                    <tr
                      key={book._id}
                      className={(index + 1) % 2 === 0 ? "bg-gray-50" : ""}
                    >
                      <td className="px-4 py-3">{index + 1}</td>
                      <td
                        onClick={() => openReadBookPopup(book.bookId)}
                        className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition duration-300"
                      >
                        {books.find((b) => b._id === book.bookId)?.title ?? "Unknown Title"}
                      </td>
                      <td className="px-4 py-3">{formatDate(book.borrowedDate)}</td>
                      <td className="px-4 py-3">
                        <span className={`${
                          new Date(book.dueDate) <= new Date() && !book.returned 
                            ? "text-red-600 font-medium" 
                            : "text-gray-900"
                        }`}>
                          {formatDate(book.dueDate)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            book.returned
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {book.returned ? "Returned" : "Not Returned"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <BookA
                          onClick={() => openReadBookPopup(book.bookId)}
                          className="text-blue-500 hover:text-blue-700 cursor-pointer mx-auto"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {bookToDisplay.map((book, index) => (
                <div
                  key={book._id}
                  className="bg-white rounded-lg shadow-lg p-4 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {books.find((b) => b._id === book.bookId)?.title ?? "Unknown Title"}
                      </h3>
                    </div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        book.returned
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {book.returned ? "Returned" : "Not Returned"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Borrowed Date:</span>
                      <span className="font-medium">{formatDate(book.borrowedDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Due Date:</span>
                      <span className={`font-medium ${
                        new Date(book.dueDate) <= new Date() && !book.returned 
                          ? "text-red-600" 
                          : "text-gray-900"
                      }`}>
                        {formatDate(book.dueDate)}
                      </span>
                    </div>
                  </div>

                  {/* Overdue warning for non-returned books */}
                  {new Date(book.dueDate) <= new Date() && !book.returned && (
                    <div className="mb-4 p-2 bg-red-50 border-l-4 border-red-400 rounded">
                      <p className="text-red-700 text-xs font-medium">
                        ⚠️ This book is overdue
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => openReadBookPopup(book.bookId)}
                      className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors w-full justify-center"
                    >
                      <BookA size={16} />
                      <span>View Book</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-32 sm:h-48">
            <h3 className="text-center font-medium text-lg sm:text-xl md:text-3xl text-gray-500 px-4">
              {filter === "returned" 
                ? "No Returned Books found" 
                : "No Non-Returned Books found"
              }
            </h3>
          </div>
        )}
      </main>

      {/* Read Book Popup */}
      {readBookPopup && <ReadBookPopup book={readBook} />}
    </>
  );
};

export default MyBorrowedBooks;
