import React from "react";
import { useDispatch } from "react-redux";
import { deleteBook } from "../store/slices/bookSlice";
import { toggleDeleteBookPopup } from "../store/slices/popUpSlice";

const DeleteBookPopup = ({ bookId }) => {
  const dispatch = useDispatch();
  const handleDelete = () => {
    dispatch(deleteBook(bookId));
    dispatch(toggleDeleteBookPopup());
  };
  return (
    <>
      <div className="fixed inset-0 bg-black/50 p-3 sm:p-5 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded shadow-lg w-96">
          <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
          <p>Are you sure to delete this book</p>

          <div className="flex justify-end gap-4 mt-6">
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={handleDelete}
            >
              Delete
            </button>
            <button
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              onClick={() => dispatch(toggleDeleteBookPopup())}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteBookPopup;
