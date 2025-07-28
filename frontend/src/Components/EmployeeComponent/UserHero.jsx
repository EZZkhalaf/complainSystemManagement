import React from 'react';

const UserHero = () => {
  return (
    <div className="w-full px-6 py-12 bg-white shadow-md rounded-2xl max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
        Welcome to the Complaint Management System
      </h1>
      <p className="text-gray-600 text-lg text-center mb-8">
        We’re glad to have you here. This platform is designed to help you share concerns, follow up on issues, and feel heard. Our goal is to make communication simple, clear, and effective.
      </p>

      <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 border rounded-xl bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Submit a Complaint</h2>
          <p className="text-gray-600">
            If something’s not right, let us know. Use the complaint form to report issues, and we’ll work to address them.
          </p>
        </div>

        <div className="p-5 border rounded-xl bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Track Your Complaints</h2>
          <p className="text-gray-600">
            You can see the status of every complaint you’ve submitted. Whether it’s being reviewed, assigned, or resolved—you’ll stay informed.
          </p>
        </div>

        <div className="p-5 border rounded-xl bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Group Collaboration</h2>
          <p className="text-gray-600">
            Join a group to stay connected with others and share updates in a more focused space. Groups help make communication smoother.
          </p>
        </div>

        <div className="p-5 border rounded-xl bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Your Information is Safe</h2>
          <p className="text-gray-600">
            Your privacy matters. All your data is handled securely and only accessible to authorized team members.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserHero;
