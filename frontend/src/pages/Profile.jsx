import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaUser, FaCalendarAlt, FaTrophy, FaCode, FaChartBar, FaArrowLeft, FaFilter } from 'react-icons/fa';

function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    language: ''
  });
  const [debugData, setDebugData] = useState(null);

  const currentUser = localStorage.getItem('loggedInUser');

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  useEffect(() => {
    if (username) {
      fetchSubmissions();
    }
  }, [username, currentPage, filters]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${apiUrl}/api/profile/${username}`);
      const data = await response.json();

      if (data.success) {
        setProfileData(data.data);
      } else {
        setError(data.message || 'Failed to fetch profile data');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filters.status && { status: filters.status }),
        ...(filters.language && { language: filters.language })
      });

      const response = await fetch(`${apiUrl}/api/submissions/${username}?${params}`);
      const data = await response.json();

      if (data.success) {
        setSubmissions(data.data.submissions);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        setError(data.message || 'Failed to fetch submissions');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Submissions fetch error:', err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-400 border-green-500';
      case 'medium': return 'text-yellow-400 border-yellow-500';
      case 'hard': return 'text-red-400 border-red-500';
      default: return 'text-gray-400 border-gray-500';
    }
  };

  const getStatusColor = (isSuccess) => {
    return isSuccess ? 'text-green-400 bg-green-900' : 'text-red-400 bg-red-900';
  };

  const getLanguageDisplay = (lang) => {
    switch (lang) {
      case 'cpp': return 'C++';
      case 'java': return 'Java';
      case 'python': return 'Python';
      default: return lang;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-400 hover:text-white p-2 rounded-md transition duration-200"
              >
                <FaArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-white">Profile</h1>
            </div>
            <div className="flex items-center space-x-4">
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
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
              <FaUser className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{profileData?.user?.name || username}</h1>
              <p className="text-gray-400">{profileData?.user?.email || 'No email available'}</p>
              <div className="flex items-center space-x-2 mt-2">
                <FaCalendarAlt className="w-4 h-4 text-gray-500" />
                <span className="text-gray-500 text-sm">
                  Joined {profileData?.user?.joinDate ? formatDate(profileData.user.joinDate) : 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{profileData?.stats?.totalSubmissions || 0}</div>
              <div className="text-gray-400 text-sm">Total Submissions</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{profileData?.stats?.acceptedSubmissions || 0}</div>
              <div className="text-gray-400 text-sm">Accepted</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{profileData?.stats?.uniqueProblemsSolved || 0}</div>
              <div className="text-gray-400 text-sm">Problems Solved</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{profileData?.stats?.acceptanceRate || 0}%</div>
              <div className="text-gray-400 text-sm">Acceptance Rate</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Solved Problems & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Difficulty Distribution */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaChartBar className="mr-2" />
                Difficulty Distribution
              </h3>
              <div className="space-y-3">
                {Object.entries(profileData?.stats.difficultyStats || {}).map(([difficulty, count]) => (
                  <div key={difficulty} className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-sm border ${getDifficultyColor(difficulty)}`}>
                      {difficulty}
                    </span>
                    <span className="text-gray-300 font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coding Score */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaTrophy className="mr-2" />
                Coding Score
              </h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">{profileData?.stats.totalScore}</div>
                <div className="text-gray-400 text-sm">Total Points</div>
              </div>
            </div>

            {/* Recent Solved Problems */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Solved Problems</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {profileData?.user.solvedProblems.slice(-5).reverse().map((problem, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                    <div>
                      <div className="text-white font-medium">{problem.title}</div>
                      <span className={`text-xs px-2 py-1 rounded border ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </div>
                    <div className="text-yellow-400 font-medium">+{problem.codingScore}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Submission History */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <FaCode className="mr-2" />
                  Submission History
                </h3>
                <div className="flex items-center space-x-2">
                  <FaFilter className="text-gray-400" />
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="accepted">Accepted</option>
                    <option value="wrong">Wrong Answer</option>
                  </select>
                  <select
                    value={filters.language}
                    onChange={(e) => handleFilterChange('language', e.target.value)}
                    className="bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm"
                  >
                    <option value="">All Languages</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                  </select>
                </div>
              </div>

              {submissionsLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-400">Loading submissions...</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Problem
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Difficulty
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Language
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Submitted
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {submissions.map((submission, index) => (
                          <tr key={index} className="hover:bg-gray-700">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-white font-medium">{submission.title}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded text-xs border ${getDifficultyColor(submission.problemId?.difficulty)}`}>
                                {submission.problemId?.difficulty || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status.success)}`}>
                                {submission.status.success ? 'Accepted' : 'Wrong Answer'}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-gray-300">
                              {getLanguageDisplay(submission.lang)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-gray-400 text-sm">
                              {formatDate(submission.timestamp)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                      >
                        Previous
                      </button>
                      <span className="text-gray-400">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
