import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaTrophy, FaMedal, FaAward, FaSearch, FaChevronLeft, FaChevronRight, FaUsers, FaCode, FaCheckCircle, FaChartBar, FaSync, FaCrown, FaStar } from 'react-icons/fa';

function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [userRank, setUserRank] = useState(null);
  const [error, setError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const currentUser = localStorage.getItem('loggedInUser');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchLeaderboard(false);
    fetchStats(false);
    if (currentUser) {
      fetchUserRank(false);
    }
  }, [currentPage, searchQuery, navigate]);

  const fetchLeaderboard = async (isRefresh = false) => {
    try {
      setLoading(true);
      setError('');
      const apiUrl = import.meta.env.VITE_API_URL;
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
        ...(searchQuery && { search: searchQuery }),
        ...(isRefresh && { refresh: 'true' })
      });

      const response = await fetch(`${apiUrl}/leaderboard?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setLeaderboardData(data.data.users || []);
        setPagination(data.data.pagination || {});
        setError('');
        
        if (isRefresh) {
          toast.success('Leaderboard refreshed successfully!');
        }
      } else {
        setError(data.message || 'Failed to fetch leaderboard');
        toast.error(data.message || 'Failed to fetch leaderboard');
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Failed to connect to server. Please ensure the backend is running.');
      toast.error('Failed to load leaderboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (isRefresh = false) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const params = isRefresh ? '?refresh=true' : '';
      
      const response = await fetch(`${apiUrl}/leaderboard/stats${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        console.warn('Failed to fetch stats:', data.message);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUserRank = async (isRefresh = false) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const params = isRefresh ? '?refresh=true' : '';
      
      const response = await fetch(`${apiUrl}/leaderboard/rank/${currentUser}${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setUserRank(data.data);
      } else {
        console.warn('Failed to fetch user rank:', data.message);
      }
    } catch (error) {
      console.error('Error fetching user rank:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Use the refresh parameter to trigger real-time stats update
      await Promise.all([
        fetchLeaderboard(true), 
        fetchStats(true), 
        fetchUserRank(true)
      ]);
    } catch (error) {
      toast.error('Failed to refresh leaderboard');
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLeaderboard(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('userRole');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getRankIcon = (rank) => {
    return <span className="text-white font-bold text-lg">{rank}</span>;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/50';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400 to-gray-500 shadow-lg shadow-gray-500/50';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-amber-700 shadow-lg shadow-amber-600/50';
    if (rank <= 10) return 'bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg shadow-purple-600/50';
    return 'bg-gray-700';
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return <FaCrown className="text-yellow-500 ml-2" />;
    if (rank <= 3) return <FaTrophy className="text-orange-500 ml-2" />;
    if (rank <= 10) return <FaStar className="text-purple-500 ml-2" />;
    return null;
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
                  to="/problems"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200"
                >
                  Problems
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
                  to={`/profile/${currentUser}`}
                  className="text-blue-400 hover:text-blue-300 transition duration-200"
                >
                  {currentUser}
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
                  to="/problems"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200 text-left"
                >
                  Problems
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
                      to={`/profile/${currentUser}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-blue-400 hover:text-blue-300 transition duration-200"
                    >
                      {currentUser}
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
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                <FaTrophy className="inline mr-2 sm:mr-3 text-yellow-500" />
                Leaderboard
              </h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition duration-200 shadow-lg text-sm sm:text-base"
              title={refreshing ? 'Updating all user stats and rankings...' : 'Refresh leaderboard with latest data'}
            >
              <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Updating Stats...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-900 bg-opacity-50 border border-red-500 rounded-lg p-4">
            <p className="text-red-200">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-red-300 hover:text-red-200 underline"
            >
              Try refreshing the page
            </button>
          </div>
        )}

        {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-900 bg-opacity-20 border border-red-500 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold">!</span>
            </div>
            <div>
              <p className="text-red-400 font-medium">Error loading leaderboard</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <button
              onClick={fetchLeaderboard}
              className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      )}
        {/* User Rank Card */}
        {userRank && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 border-2 border-blue-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center">
                <div className="text-3xl sm:text-4xl mr-3 sm:mr-4">
                  {getRankIcon(userRank.userRank)}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
                    Your Rank
                    {getRankBadge(userRank.userRank)}
                  </h3>
                  <p className="text-blue-100 text-sm sm:text-base">
                    #{userRank.userRank} out of {userRank.totalUsers} users
                  </p>
                </div>
              </div>
              <Link
                to={`/profile/${currentUser}`}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition duration-200 text-center text-sm sm:text-base"
              >
                View Profile
              </Link>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-4 sm:mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div className="flex gap-2 sm:gap-4">
              <button
                type="submit"
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg transition duration-200 text-sm sm:text-base"
              >
                Search
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                    setTimeout(fetchLeaderboard, 100);
                  }}
                  className="flex-1 sm:flex-none bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition duration-200 text-sm sm:text-base"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Leaderboard - Mobile Cards */}
        <div className="block md:hidden space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-400">Loading leaderboard...</p>
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="text-center py-12 px-4">
              <FaUsers className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">No users found</h3>
              <p className="text-gray-500">Try adjusting your search criteria.</p>
            </div>
          ) : (
            leaderboardData.map((user, index) => (
              <div
                key={user._id}
                className={`bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-blue-500 transition duration-200 ${
                  user.name === currentUser ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-900 bg-opacity-10' : ''
                }`}
              >
                {/* Rank and User Info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${getRankColor(user.rank)}`}>
                      {getRankIcon(user.rank)}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <Link
                          to={`/profile/${user.name}`}
                          className="text-base font-semibold text-white hover:text-blue-400 transition duration-200"
                        >
                          {user.name}
                        </Link>
                        <div className="text-xs text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </div>
                  {user.name === currentUser && (
                    <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      You
                    </div>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-700 bg-opacity-50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Coding Score</div>
                    <div className="text-lg font-bold text-yellow-500">{user.totalCodingScore}</div>
                  </div>
                  <div className="bg-gray-700 bg-opacity-50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Problems Solved</div>
                    <div className="text-lg font-bold text-green-400">{user.problemsSolved}</div>
                  </div>
                  <div className="bg-gray-700 bg-opacity-50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Submissions</div>
                    <div className="text-sm text-gray-300">{user.acceptedSubmissions} / {user.totalSubmissions}</div>
                  </div>
                  <div className="bg-gray-700 bg-opacity-50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Acceptance Rate</div>
                    <div className="text-sm text-gray-300">{user.acceptanceRate}%</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Leaderboard - Desktop Table */}
        <div className="hidden md:block bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-750">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Coding Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Problems Solved
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Submissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Acceptance Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : leaderboardData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  leaderboardData.map((user, index) => (
                    <tr 
                      key={user._id} 
                      className={`hover:bg-gray-750 transition duration-200 ${
                        user.name === currentUser ? 'bg-blue-900 bg-opacity-20' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${getRankColor(user.rank)}`}>
                          <div className="text-lg">
                            {getRankIcon(user.rank)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <Link
                              to={`/profile/${user.name}`}
                              className="text-sm font-medium text-white hover:text-blue-400 transition duration-200"
                            >
                              {user.name}
                            </Link>
                            <div className="text-xs text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-yellow-500">
                          {user.totalCodingScore}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-green-400 font-medium">
                          {user.problemsSolved}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {user.acceptedSubmissions} / {user.totalSubmissions}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {user.acceptanceRate}%
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
            <div className="text-sm text-gray-400 text-center sm:text-left">
              Showing {((currentPage - 1) * 50) + 1} to {Math.min(currentPage * 50, pagination.totalUsers)} of {pagination.totalUsers} users
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center"
              >
                <FaChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Previous</span>
              </button>
              <span className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg">
                {currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center"
              >
                <span className="hidden sm:inline mr-2">Next</span>
                <FaChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
