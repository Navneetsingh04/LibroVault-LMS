import React from "react";
import { useSelector } from "react-redux";
import Header from "../layout/Header";

const Users = () => {
  const { users } = useSelector((state) => state.user);
  
  const formatDate = (timeStamp) => {
    const date = new Date(timeStamp);
    const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    return `${formattedDate} ${formattedTime}`;
  };
  
  return (
    <>
      <main className="relative flex-1 p-4 sm:p-6 pt-24 sm:pt-28">
        <Header />
        
        <header className="mb-6">
          <h2 className="text-xl font-medium md:text-2xl md:font-semibold">Registered Users</h2>
        </header>
        {/* Users Display */}
        {users && users.filter((u) => u.role === "User").length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-md shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Role</th>
                      <th className="px-4 py-3 text-center">Books Borrowed</th>
                      <th className="px-4 py-3 text-center">Registered On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter((u) => u.role === "User").map((user, index) => (
                      <tr key={user._id} className={(index+1) % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3 font-medium">{user.name}</td>
                        <td className="px-4 py-3 text-gray-600">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-medium">{user?.borrowedBooks.length}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600">{formatDate(user.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {users.filter((u) => u.role === "User").map((user, index) => (
                <div
                  key={user._id}
                  className="bg-white rounded-lg shadow-lg p-4 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {user.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {user.email}
                      </p>
                    </div>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {user.role}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Books Borrowed</span>
                      <div className="font-semibold text-lg text-gray-900 mt-1">
                        {user?.borrowedBooks.length}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Member Since</span>
                      <div className="font-medium text-gray-900 mt-1 text-sm">
                        {formatDate(user.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* User Stats */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>User ID: #{index + 1}</span>
                      <span className={`px-2 py-1 rounded-full ${
                        user?.borrowedBooks.length > 0 
                          ? "bg-green-100 text-green-700" 
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {user?.borrowedBooks.length > 0 ? "Active Borrower" : "No Active Loans"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-32 sm:h-48">
            <h3 className="text-center font-medium text-lg sm:text-xl md:text-3xl text-gray-500 px-4">
              No Registered Users found in library
            </h3>
          </div>
        )}
      </main>
    </>
  );
};

export default Users;