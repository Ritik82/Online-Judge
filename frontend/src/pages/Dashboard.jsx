import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function Dashboard() {
  const [user, setUser] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[60px] sm:h-[50px]">
            {/* Logo and Desktop Navigation */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white mr-8">Online Judge</h1>
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-gray-300 text-sm">
                Welcome, {user}!
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition duration-200"
              >
                Logout
              </button>
            </div>

            {/* Mobile Hamburger Menu Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-300 hover:text-white focus:outline-none focus:text-white transition duration-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-700 py-4">
              <div className="flex flex-col space-y-3">
                
                {/* Mobile User Info */}
                <div className="pt-3 border-t border-gray-700">
                  <div className="text-gray-300 text-sm px-3 py-2">
                    Welcome, {user}!
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition duration-200 mt-2 mx-3"
                    style={{ width: 'calc(100% - 1.5rem)' }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4">
              Dashboard
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 mb-6 sm:mb-8 px-4">
              Start your coding journey today!
            </p>
            
            {/* Grid with cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-12">
              <div className="bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition duration-200">
                <div className="flex flex-col h-full">
                  <div className="mb-3 sm:mb-4">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Problems</h3>
                  <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 flex-1">Browse and solve coding problems to improve your skills</p>
                  <Link
                    to="/problems"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 inline-block text-center w-full text-sm sm:text-base"
                  >
                    View Problems
                  </Link>
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-700 hover:border-green-500 transition duration-200">
                <div className="flex flex-col h-full">
                  <div className="mb-3 sm:mb-4">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-green-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Leaderboard</h3>
                  <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 flex-1">See how you rank among other competitive programmers</p>
                  <Link to="/leaderboard" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200 w-full text-sm sm:text-base">
                    View Rankings
                  </Link>
                </div>
              </div>

              <div className="bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-700 hover:border-orange-500 transition duration-200">
                <div className="flex flex-col h-full">
                  <div className="mb-3 sm:mb-4">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-orange-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Online Compiler</h3>
                  <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 flex-1">Write, compile and run code online in multiple languages</p>
                  <Link
                    to="/compiler"
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition duration-200 inline-block text-center w-full text-sm sm:text-base"
                  >
                    Open Compiler
                  </Link>
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition duration-200">
                <div className="flex flex-col h-full">
                  <div className="mb-3 sm:mb-4">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Profile</h3>
                  <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 flex-1">View your submission history and track your progress</p>
                  <Link
                    to={`/profile/${user}`}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition duration-200 inline-block text-center w-full text-sm sm:text-base"
                  >
                    My Profile
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-400">&copy; 2024 Online Judge. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                About
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                Help
              </a>
              <a href="https://github.com/Ritik82" className="text-gray-400 hover:text-white transition duration-200">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;