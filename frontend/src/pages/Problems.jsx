import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function Problems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [filter, setFilter] = useState({
    difficulty: '',
    tag: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const loggedInUser = localStorage.getItem('loggedInUser');

    if (!token) {
      navigate('/login');
    } else {
      setUser(loggedInUser);
      fetchProblems();
    }
  }, [navigate]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        navigate('/login');
        return;
      }
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filter.difficulty) params.append('difficulty', filter.difficulty);
      if (filter.tag) params.append('tags', filter.tag);
      
      const url = `${apiUrl}/problems?${params.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProblems(data.problems || []);
      } else if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        navigate('/login');
      } else {
        const errorData = await response.text();
        toast.error('Failed to fetch problems');
      }
    } catch (error) {
      toast.error('Error loading problems');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyFilters = () => {
    fetchProblems();
  };

  const clearFilters = () => {
    setFilter({ difficulty: '', tag: '' });
    setTimeout(() => fetchProblems(), 100);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'text-green-400 bg-green-900/30 border-green-500';
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/30 border-yellow-500';
      case 'hard':
        return 'text-red-400 bg-red-900/30 border-red-500';
      default:
        return 'text-gray-400 bg-gray-900/30 border-gray-500';
    }
  };

  const getTagColor = (index) => {
    const colors = [
      'text-blue-400 bg-blue-900/30 border-blue-500',
      'text-purple-400 bg-purple-900/30 border-purple-500',
      'text-indigo-400 bg-indigo-900/30 border-indigo-500',
      'text-pink-400 bg-pink-900/30 border-pink-500',
      'text-cyan-400 bg-cyan-900/30 border-cyan-500'
    ];
    return colors[index % colors.length];
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
              
              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center space-x-6">
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200"
                >
                  Dashboard
                </Link>
                <Link
                  to="/leaderboard"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200"
                >
                  Leaderboard
                </Link>
                <Link
                  to="/compiler"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200"
                >
                  Compiler
                </Link>
              </div>
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-gray-300 text-sm">
                Welcome,{" "}
                <Link
                  to={`/profile/${user}`}
                  className="text-blue-400 hover:text-blue-300 transition duration-200"
                >
                  {user}
                </Link>
                !
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
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200 text-left"
                >
                  Dashboard
                </Link>
                <Link
                  to="/leaderboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200 text-left"
                >
                  Leaderboard
                </Link>
                <Link
                  to="/compiler"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200 text-left"
                >
                  Compiler
                </Link>
                
                {/* Mobile User Info */}
                <div className="pt-3 border-t border-gray-700">
                  <div className="text-gray-300 text-sm px-3 py-2">
                    Welcome,{" "}
                    <Link
                      to={`/profile/${user}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-blue-400 hover:text-blue-300 transition duration-200"
                    >
                      {user}
                    </Link>
                    !
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
        <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4">Problems</h1>
            <p className="text-lg sm:text-xl text-gray-400 px-4">
              Challenge yourself with coding problems of varying difficulty
            </p>
          </div>

          {/* Filters */}
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-700">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:gap-3 flex-1">
                <div className="w-full sm:w-auto">
                  <label className="block text-sm font-medium text-gray-300 mb-1 sm:hidden">Difficulty</label>
                  <select
                    value={filter.difficulty}
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                    className="w-full sm:w-auto bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div className="w-full sm:w-auto sm:min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-300 mb-1 sm:hidden">Tag</label>
                  <input
                    type="text"
                    placeholder="Tag (e.g., Array)"
                    value={filter.tag}
                    onChange={(e) => handleFilterChange('tag', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={applyFilters}
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 text-sm font-medium"
                >
                  Apply
                </button>
                <button
                  onClick={clearFilters}
                  className="flex-1 sm:flex-none bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition duration-200 text-sm font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-400 mt-4">Loading problems...</p>
            </div>
          ) : problems.length === 0 ? (
            <div className="text-center py-8 sm:py-12 px-4">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-400 mb-2">No Problems Found</h3>
              <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
                {filter.difficulty || filter.tag ? 
                  "No problems match your current filters. Try adjusting your search criteria." :
                  "No problems are available at the moment. Check back later!"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {problems.map((problem, index) => (
                <div
                  key={problem._id}
                  onClick={() => navigate(`/problem/${problem._id}`)}
                  className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700 hover:border-blue-500 transition duration-200 cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <span className="text-gray-400 font-medium text-sm min-w-[3rem] shrink-0">
                        #{index + 1}
                      </span>
                      <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                        {problem.title}
                      </h3>
                      {problem.tags && problem.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {problem.tags.slice(0, window.innerWidth < 640 ? 2 : 3).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className={`px-1.5 py-0.5 rounded-full text-xs font-medium border ${getTagColor(tagIndex)} shrink-0`}
                            >
                              {tag}
                            </span>
                          ))}
                          {problem.tags.length > (window.innerWidth < 640 ? 2 : 3) && (
                            <span className="text-gray-400 text-xs self-center">
                              +{problem.tags.length - (window.innerWidth < 640 ? 2 : 3)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)} whitespace-nowrap self-start sm:self-center shrink-0`}>
                      {problem.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">&copy; 2024 Online Judge. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end space-x-4 sm:space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition duration-200 text-sm">
                About
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-200 text-sm">
                Help
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-200 text-sm">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Problems;
