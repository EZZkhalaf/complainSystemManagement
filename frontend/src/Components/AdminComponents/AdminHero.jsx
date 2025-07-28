import React from 'react';

const AdminHero = () => {
  const complaintCount = 13 ;
  const userCount = 100;
  const groupsCount = 5;
  return (
    <div className="w-full px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Welcome Text */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Welcome, Admin!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's an overview of the system status.
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-2 gap-6">
          <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Complaints</h2>
            <p className="text-3xl font-bold text-blue-600">{complaintCount}</p>
          </div>

          <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Users</h2>
            <p className="text-3xl font-bold text-green-600">{userCount}</p>
          </div>

          <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Groups</h2>
            <p className="text-3xl font-bold text-green-600">{groupsCount}</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminHero;
