import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Dashboard from '../components/admin/Dashboard';
import UsersManagement from '../components/admin/UsersManagement';
import ProblemsManagement from '../components/admin/ProblemsManagement';
import AddProblemModal from '../components/admin/AddProblemModal';
import EditProblemModal from '../components/admin/EditProblemModal';

function Admin() {
    const [dashboardData, setDashboardData] = useState(null);
    const [users, setUsers] = useState([]);
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showAddProblemModal, setShowAddProblemModal] = useState(false);
    const [showEditProblemModal, setShowEditProblemModal] = useState(false);
    const [editingProblem, setEditingProblem] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');

        if (!token || userRole !== 'admin') {
            toast.error('Access denied. Admin privileges required.');
            navigate('/login');
            return;
        }

        fetchDashboardData();
    }, [navigate]);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const authUrl = import.meta.env.VITE_AUTH_URL;

            const { data } = await axios.get(`${authUrl}/admin/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setDashboardData(data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const authUrl = import.meta.env.VITE_AUTH_URL;

            const { data } = await axios.get(`${authUrl}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setUsers(data.users);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        }
    };

    const fetchProblems = async () => {
        try {
            const token = localStorage.getItem('token');
            const authUrl = import.meta.env.VITE_AUTH_URL;

            const { data } = await axios.get(`${authUrl}/admin/problems`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setProblems(data.problems);
        } catch (error) {
            console.error('Error fetching problems:', error);
            toast.error('Failed to load problems');
        }
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

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'users' && users.length === 0) {
            fetchUsers();
        } else if (tab === 'problems' && problems.length === 0) {
            fetchProblems();
        }
    };

    const openEditModal = (problem) => {
        setEditingProblem(problem);
        setShowEditProblemModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Navigation */}
            <nav className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-[60px] sm:h-[50px]">
                        {/* Logo and Desktop Navigation */}
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-white mr-8">Admin Panel</h1>
                            
                            {/* Desktop Navigation Links */}
                            <div className="hidden md:flex items-center space-x-6">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200"
                                >
                                    User Dashboard
                                </button>
                            </div>
                        </div>

                        {/* Desktop User Menu */}
                        <div className="hidden md:flex items-center space-x-4">
                            <span className="text-gray-300 text-sm">
                                Welcome, Admin {localStorage.getItem('loggedInUser')}!
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
                                <button
                                    onClick={() => {
                                        navigate('/dashboard');
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200 text-left"
                                >
                                    User Dashboard
                                </button>
                                
                                {/* Mobile User Info */}
                                <div className="pt-3 border-t border-gray-700">
                                    <div className="text-gray-300 text-sm px-3 py-2">
                                        Welcome, Admin {localStorage.getItem('loggedInUser')}!
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tab Navigation */}
                <div className="mb-8">
                    <div className="border-b border-gray-700">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => handleTabChange('dashboard')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'dashboard'
                                        ? 'border-blue-500 text-blue-400'
                                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                                    }`}
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => handleTabChange('users')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'users'
                                        ? 'border-blue-500 text-blue-400'
                                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                                    }`}
                            >
                                Users Management
                            </button>
                            <button
                                onClick={() => handleTabChange('problems')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'problems'
                                        ? 'border-blue-500 text-blue-400'
                                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                                    }`}
                            >
                                Problems Management
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'dashboard' && (
                    <Dashboard dashboardData={dashboardData} />
                )}

                {activeTab === 'users' && (
                    <UsersManagement 
                        users={users}
                        onRefreshUsers={fetchUsers}
                        onRefreshDashboard={fetchDashboardData}
                    />
                )}

                {activeTab === 'problems' && (
                    <ProblemsManagement 
                        problems={problems}
                        onRefreshProblems={fetchProblems}
                        onAddProblem={() => setShowAddProblemModal(true)}
                        onEditProblem={openEditModal}
                    />
                )}

                {/* Modals */}
                <AddProblemModal 
                    isOpen={showAddProblemModal}
                    onClose={() => setShowAddProblemModal(false)}
                    onRefreshProblems={fetchProblems}
                />

                <EditProblemModal 
                    isOpen={showEditProblemModal}
                    problem={editingProblem}
                    onClose={() => {
                        setShowEditProblemModal(false);
                        setEditingProblem(null);
                    }}
                    onRefreshProblems={fetchProblems}
                />
            </div>
        </div>
    );
}

export default Admin;
