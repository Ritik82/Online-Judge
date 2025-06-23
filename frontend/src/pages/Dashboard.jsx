import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Dashboard() {
  const [user, setUser] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const loggedInUser = localStorage.getItem('loggedInUser');

    if (!token) {
      navigate('/login');
    } else {
      setUser(loggedInUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">Online Judge</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Dashboard
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Start your coding journey today!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Problems</h3>
              <p className="text-gray-400 mb-4">Browse and solve coding problems</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200">
                View Problems
              </button>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Contests</h3>
              <p className="text-gray-400 mb-4">Participate in programming contests</p>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200">
                Join Contest
              </button>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Profile</h3>
              <p className="text-gray-400 mb-4">View your submission history</p>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition duration-200">
                My Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;