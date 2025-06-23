import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
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
              <Link
                to="/login"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Welcome to Online Judge
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Practice coding problems, participate in contests, and improve your programming skills. 
            Join thousands of developers who are mastering algorithms and data structures.
          </p>
          
          <div className="flex justify-center space-x-4 mb-12">
            <Link
              to="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition duration-200"
            >
              Get Started
            </Link>
            
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Practice Problems</h3>
            <p className="text-gray-400">
              Solve hundreds of coding problems ranging from beginner to advanced levels. 
              Improve your problem-solving skills with our curated collection.
            </p>
          </div>
          
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Live Contests</h3>
            <p className="text-gray-400">
              Participate in regular programming contests. Compete with developers worldwide 
              and climb the leaderboard.
            </p>
          </div>
          
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Track Progress</h3>
            <p className="text-gray-400">
              Monitor your coding journey with detailed analytics. See your improvement 
              over time and identify areas to focus on.
            </p>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mt-16 bg-gray-800 rounded-xl p-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">1000+</div>
              <div className="text-gray-400">Problems</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400 mb-2">50+</div>
              <div className="text-gray-400">Contests</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400 mb-2">10K+</div>
              <div className="text-gray-400">Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400 mb-2">100K+</div>
              <div className="text-gray-400">Submissions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 Online Judge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;