import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addBook, fetchAllBooks } from "../store/slices/bookSlice";
import { toggleAddBookPopup } from "../store/slices/popUpSlice";

const AddBookPopup = () => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");

  const handleAddBook = async (e) => {
    e.preventDefault();

    if (!title || !author || !price || !quantity || !description) {
      alert("Please fill all the fields");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("price", price);
    formData.append("quantity", quantity);
    formData.append("description", description);

    dispatch(addBook(formData));
    dispatch(fetchAllBooks());

    setTitle("");
    setAuthor("");
    setPrice("");
    setQuantity("");
    setDescription("");
    dispatch(toggleAddBookPopup());
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center z-50">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Add New Book</h3>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              onClick={() => dispatch(toggleAddBookPopup())}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleAddBook} className="space-y-5">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Book Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter book title"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Book Author</label>
              <input
                type="text"
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Enter author name"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">Book Price (₹)</label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">Book Quantity</label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  min="1"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Book Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter book description..."
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                required
                rows="4"
                maxLength="500"
              />
              <div className="text-right text-xs text-gray-500">
                {description.length}/500 characters
              </div>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                onClick={() => dispatch(toggleAddBookPopup())}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-3 sm:px-4 py-2 bg-black rounded-md text-white hover:bg-gray-800 text-sm sm:text-base cursor-pointer"
              >
                Add Book
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBookPopup;
