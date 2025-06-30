import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 flex-shrink-0">
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

      {/* Main Content */}
      <div className="flex-1">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Welcome to <span className="text-blue-400">Online Judge</span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed">
              Master programming through practice. Solve challenging problems, participate in contests, 
              and improve your coding skills with our comprehensive online judge platform.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Get Started
              </Link>
              
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition duration-200">
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4 text-center">Practice Problems</h3>
                <p className="text-gray-400 text-center flex-1">
                  Solve hundreds of coding problems ranging from beginner to advanced levels. 
                  Improve your problem-solving skills with our curated collection.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-green-500 transition duration-200">
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4 text-center">Live Contests</h3>
                <p className="text-gray-400 text-center flex-1">
                  Participate in regular programming contests. Compete with developers worldwide 
                  and climb the leaderboard to showcase your skills.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-orange-500 transition duration-200">
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4 text-center">Online Compiler</h3>
                <p className="text-gray-400 text-center flex-1">
                  Write, compile, and run code online in multiple programming languages. 
                  Test your solutions instantly without any setup.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition duration-200">
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4 text-center">Track Progress</h3>
                <p className="text-gray-400 text-center flex-1">
                  Monitor your coding journey with detailed analytics. See your improvement 
                  over time and identify areas to focus on.
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="mt-20 bg-gray-800 rounded-xl p-8 border border-gray-700">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Join Our Growing Community</h2>
              <p className="text-gray-400 text-lg">Thousands of developers are already improving their skills</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">1000+</div>
                <div className="text-gray-400 font-medium">Coding Problems</div>
                <div className="text-xs text-gray-500 mt-1">From Easy to Expert</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-green-400 mb-2">50+</div>
                <div className="text-gray-400 font-medium">Active Contests</div>
                <div className="text-xs text-gray-500 mt-1">Weekly Competitions</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">10K+</div>
                <div className="text-gray-400 font-medium">Active Users</div>
                <div className="text-xs text-gray-500 mt-1">Global Community</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-yellow-400 mb-2">100K+</div>
                <div className="text-gray-400 font-medium">Code Submissions</div>
                <div className="text-xs text-gray-500 mt-1">Solutions Tested</div>
              </div>
            </div>
          </div>

          {/* Languages Support Section */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Supported Languages</h2>
              <p className="text-gray-400 text-lg">Code in your favorite programming language</p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8">
              <div className="flex items-center gap-3 bg-gray-800 px-6 py-3 rounded-lg border border-gray-700">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-300 font-medium">C++ (GCC)</span>
              </div>
              <div className="flex items-center gap-3 bg-gray-800 px-6 py-3 rounded-lg border border-gray-700">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-300 font-medium">Java (OpenJDK)</span>
              </div>
              <div className="flex items-center gap-3 bg-gray-800 px-6 py-3 rounded-lg border border-gray-700">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-300 font-medium">Python 3</span>
              </div>
              <div className="flex items-center gap-3 bg-gray-800 px-6 py-3 rounded-lg border border-gray-700">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-gray-300 font-medium">More Coming Soon</span>
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
              <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                Contact
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                Privacy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;