import React from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

function ProblemsManagement({ problems, onRefreshProblems, onAddProblem, onEditProblem }) {
  
  const deleteProblem = async (problemId) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const authUrl = import.meta.env.VITE_AUTH_URL;

      await axios.delete(`${authUrl}/admin/problems/${problemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      toast.success('Problem deleted successfully');
      onRefreshProblems();
    } catch (error) {
      console.error('Error deleting problem:', error);
      toast.error('Failed to delete problem');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Problems Management</h2>
      
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">All Problems</h3>
            <button
              onClick={onAddProblem}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition duration-200"
            >
              Add New Problem
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-750">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {problems.map((problem) => (
                <tr key={problem._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{problem.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
                      problem.difficulty === 'Easy' ? 'bg-green-900/30 text-green-300 border-green-500/30' :
                      problem.difficulty === 'Medium' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30' :
                      'bg-red-900/30 text-red-300 border-red-500/30'
                    }`}>
                      {problem.difficulty === 'Easy' ? '🟢' : problem.difficulty === 'Medium' ? '🟡' : '🔴'} {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-2">
                      {problem.tags && problem.tags.length > 0 ? (
                        problem.tags.map((tag, index) => (
                          <span 
                            key={tag} 
                            className={`text-xs font-semibold rounded-full px-3 py-1 ${
                              index % 3 === 0 ? 'bg-blue-900/30 text-blue-300 border border-blue-500/30' :
                              index % 3 === 1 ? 'bg-green-900/30 text-green-300 border border-green-500/30' :
                              'bg-purple-900/30 text-purple-300 border border-purple-500/30'
                            }`}
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500 italic">No tags</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {problem.createdAt ? 
                      new Date(problem.createdAt).toLocaleDateString() : 
                      'Unknown'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEditProblem(problem)}
                        className="text-yellow-400 hover:text-yellow-300 transition duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProblem(problem._id)}
                        className="text-red-400 hover:text-red-300 transition duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProblemsManagement;
