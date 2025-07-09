import React, { useEffect, useState } from "react";
import { BookA, NotebookPen, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  toggleReadBookPopup,
  toggleRecordBookPopup,
  toggleAddBookPopup,
  toggleDeleteBookPopup,
} from "../store/slices/popUpSlice";
import { resetBookSlice, fetchAllBooks } from "../store/slices/bookSlice";
import {
  resetBorrowSlice,
  fetchUserBorrowedBooks,
  recordBorrowedBook,
} from "../store/slices/borrowSlice";
import Header from "../layout/Header";
import AddBookPopup from "../popups/AddBookPopup";
import ReadBookPopup from "../popups/ReadBookPopup";
import RecordBookPopup from "../popups/RecordBookPopup";
import DeleteBookPopup from "../popups/DeleteBookPopup";

const BookManagement = () => {
  const dispatch = useDispatch();
  const { loading, error, message, books } = useSelector((state) => state.book);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const {
    addBookPopup,
    readBookPopup,
    recordBookPopup,
    deleteBookPopup,
    bookIdToDelete,
  } = useSelector((state) => state.popup);

  const {
    loading: borrowLoading,
    error: borrowError,
    message: borrowMessage,
  } = useSelector((state) => state.borrow);

  const [readBook, setReadBook] = useState({});
  const openReadBookPopup = (id) => {
    const book = books.find((book) => book._id === id);
    if (book) {
      setReadBook(book);
    }
    dispatch(toggleReadBookPopup());
  };

  const [borrowBookId, setBorrowBookId] = useState("");
  const openRecordBookPopup = (id) => {
    setBorrowBookId(id);
    if (user?.role === "Admin") {
      // For admins, open the popup to enter user email
      dispatch(toggleRecordBookPopup());
    } else {
      // For users, borrow directly with their own email
      if (user?.email) {
        console.log("User borrowing book:", { email: user.email, bookId: id });
        dispatch(recordBorrowedBook(user.email, id));
      } else {
        toast.error("User email not found. Please try logging in again.");
      }
    }
  };

  useEffect(() => {
    dispatch(fetchAllBooks());
    if (user?.role === "User") {
      dispatch(fetchUserBorrowedBooks());
    }
  }, [dispatch, user?.role]);

  useEffect(() => {
    if (message || borrowMessage) {
      toast.success(message || borrowMessage);
      dispatch(fetchAllBooks());
      dispatch(fetchUserBorrowedBooks());
      dispatch(resetBookSlice());
      dispatch(resetBorrowSlice());
    }
    if (error || borrowError) {
      toast.error(error || borrowError);
      dispatch(resetBookSlice());
      dispatch(resetBorrowSlice());
    }
  }, [
    dispatch,
    error,
    message,
    loading,
    borrowError,
    borrowMessage,
    borrowLoading,
  ]);

  const [searchedKeyword, setSearchedKeyword] = useState("");
  const handleSearch = (e) => {
    setSearchedKeyword(e.target.value.toLowerCase());
  };
  const searchedBooks =
    books?.filter((book) =>
      book?.title?.toLowerCase().includes(searchedKeyword)
    ) || [];

  return (
    <>
      <main className="relative flex-1 p-4 sm:p-6 pt-24 sm:pt-28 overflow-auto min-h-screen">
        <Header />

        {/* Sub Header */}
        <header className="flex flex-col gap-4 mb-6">
          <h2 className="text-xl font-medium md:text-2xl md:font-semibold">
            {user && user.role === "Admin" ? "Book Management" : "Books"}
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {isAuthenticated && user?.role === "Admin" && (
              <button
                className="relative pl-12 pr-6 w-full sm:w-auto sm:min-w-48 flex items-center bg-black text-white py-3 rounded-md hover:bg-gray-800 transition duration-300 group"
                onClick={() => dispatch(toggleAddBookPopup())}
              >
                <span className="absolute left-4 flex items-center justify-center bg-white text-black rounded-full w-6 h-6 font-medium group-hover:scale-110 transition-transform cursor-pointer">
                  +
                </span>
                <span className="w-full text-center font-medium tracking-wide cursor-pointer">
                  Add Book
                </span>
              </button>
            )}
            <input
              type="text"
              placeholder="Search books..."
              className="w-full sm:w-48 border border-gray-300 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchedKeyword}
              onChange={handleSearch}
            />
          </div>
        </header>

        {/* Books Display */}
        {books?.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block w-full overflow-x-auto bg-white rounded-md shadow-lg">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="py-3 px-4 text-left">ID</th>
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-left">Author</th>
                    {isAuthenticated && user?.role === "Admin" && (
                      <th className="py-3 px-4 text-left">Quantity</th>
                    )}
                    <th className="py-3 px-4 text-left">Price</th>
                    <th className="py-3 px-4 text-left">Availability</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {searchedBooks.map((book, index) => (
                    <tr
                      key={book._id}
                      className={(index + 1) % 2 === 0 ? "bg-gray-50" : ""}
                    >
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">{book.title}</td>
                      <td className="py-3 px-4">{book.author}</td>
                      {isAuthenticated && user?.role === "Admin" && (
                        <td className="py-3 px-4">{book.quantity}</td>
                      )}
                      <td className="py-3 px-4">₹ {book.price}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs ${
                            book.availability
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {book.availability ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isAuthenticated && user?.role === "Admin" ? (
                          <div className="flex space-x-4 justify-center">
                            <BookA
                              className="text-blue-500 cursor-pointer hover:text-blue-700"
                              onClick={() => openReadBookPopup(book._id)}
                            />
                            <NotebookPen
                              className="text-green-500 cursor-pointer hover:text-green-700"
                              onClick={() => openRecordBookPopup(book._id)}
                            />
                            <Trash2
                              className="text-red-500 cursor-pointer hover:text-red-700"
                              onClick={() => {
                                dispatch(toggleDeleteBookPopup(book._id));
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex gap-x-2 justify-center">
                            <button
                              onClick={() => openReadBookPopup(book._id)}
                              className="text-blue-500 hover:text-blue-700 px-3 py-1 rounded transition-colors"
                            >
                              Read
                            </button>
                            <button
                              onClick={() => openRecordBookPopup(book._id)}
                              disabled={!book.availability || borrowLoading}
                              className={`px-3 py-1 rounded transition-colors ${
                                book.availability && !borrowLoading
                                  ? "text-green-500 hover:text-green-700"
                                  : "text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              {borrowLoading 
                                ? "Borrowing..." 
                                : book.availability 
                                  ? "Borrow" 
                                  : "Unavailable"
                              }
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {searchedBooks.map((book, index) => (
                <div
                  key={book._id}
                  className="bg-white rounded-lg shadow-lg p-4 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {book.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        by {book.author}
                      </p>
                    </div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        book.availability
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {book.availability ? "Available" : "Unavailable"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Price:</span>
                      <span className="ml-1 font-medium">₹ {book.price}</span>
                    </div>
                    {isAuthenticated && user?.role === "Admin" && (
                      <div>
                        <span className="text-gray-500">Quantity:</span>
                        <span className="ml-1 font-medium">{book.quantity}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {isAuthenticated && user?.role === "Admin" ? (
                      <>
                        <button
                          onClick={() => openReadBookPopup(book._id)}
                          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex-1"
                        >
                          <BookA size={16} />
                          <span>Read</span>
                        </button>
                        <button
                          onClick={() => openRecordBookPopup(book._id)}
                          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex-1"
                        >
                          <NotebookPen size={16} />
                          <span>Borrow</span>
                        </button>
                        <button
                          onClick={() => {
                            dispatch(toggleDeleteBookPopup(book._id));
                          }}
                          className="flex items-center justify-center bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => openReadBookPopup(book._id)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex-1"
                        >
                          Read
                        </button>
                        <button
                          onClick={() => openRecordBookPopup(book._id)}
                          disabled={!book.availability}
                          className={`px-4 py-2 rounded-md transition-colors flex-1 ${
                            book.availability
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          {book.availability ? "Borrow" : "Unavailable"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-32 sm:h-48">
            <h3 className="text-center font-medium text-lg sm:text-xl md:text-3xl text-gray-500 px-4">
              No books available.
            </h3>
          </div>
        )}
      </main>
      {addBookPopup && <AddBookPopup />}
      {readBookPopup && <ReadBookPopup book={readBook} />}
      {recordBookPopup && <RecordBookPopup bookId={borrowBookId} />}
      {deleteBookPopup && <DeleteBookPopup bookId={bookIdToDelete} />}
    </>
  );
};

export default BookManagement;
