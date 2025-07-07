import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function Problems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState('');
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
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="text-xl font-bold text-white ">
                Online Judge
              </div>
              <Link to="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                Dashboard
              </Link>
              <Link to="/leaderboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                Leaderboard
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">
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
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Problems</h1>
            <p className="text-xl text-gray-400">
              Challenge yourself with coding problems of varying difficulty
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gray-800 rounded-lg px-4 py-3 mb-6 border border-gray-700 gap-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3 flex-1">
              <div>
                <label className="sr-only">Difficulty</label>
                <select
                  value={filter.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="sr-only">Tag</label>
                <input
                  type="text"
                  placeholder="Tag (e.g., Array)"
                  value={filter.tag}
                  onChange={(e) => handleFilterChange('tag', e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={applyFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition duration-200 text-sm"
              >
                Apply
              </button>
              <button
                onClick={clearFilters}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition duration-200 text-sm"
              >
                Clear
              </button>
            </div>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-400 mt-4">Loading problems...</p>
            </div>
          ) : problems.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Problems Found</h3>
              <p className="text-gray-500">
                {filter.difficulty || filter.tag ? 
                  "No problems match your current filters. Try adjusting your search criteria." :
                  "No problems are available at the moment. Check back later!"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {problems.map((problem, index) => (
                <div
                  key={problem._id}
                  onClick={() => navigate(`/problem/${problem._id}`)}
                  className="bg-gray-800 rounded-lg p-2 border border-gray-700 hover:border-blue-500 transition duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 font-medium text-sm min-w-[2rem]">
                        #{index + 1}
                      </span>
                      <h3 className="text-sm font-semibold text-white">
                        {problem.title}
                      </h3>
                      {problem.tags && problem.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 ml-2">
                          {problem.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className={`px-1.5 py-0.5 rounded-full text-xs font-medium border ${getTagColor(tagIndex)}`}
                            >
                              {tag}
                            </span>
                          ))}
                          {problem.tags.length > 3 && (
                            <span className="text-gray-400 text-xs">+{problem.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)} whitespace-nowrap`}>
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Problems;
