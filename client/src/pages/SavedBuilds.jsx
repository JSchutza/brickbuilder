import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getBuilds, deleteBuild } from '../services/buildService';
import { useEditorStore } from '../features/editor/editorStore';
import LoadingSpinner from '../components/LoadingSpinner';

const SavedBuilds = () => {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const loadBuild = useEditorStore(state => state.loadBuild);

  useEffect(() => {
    const fetchBuilds = async () => {
      try {
        const data = await getBuilds();
        setBuilds(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load your builds');
        setLoading(false);
      }
    };

    fetchBuilds();
  }, []);

  const handleLoadBuild = async (id) => {
    try {
      await loadBuild(id);
      navigate('/editor');
    } catch (err) {
      setError('Failed to load build');
    }
  };

  const handleDeleteBuild = async (id) => {
    if (window.confirm('Are you sure you want to delete this build?')) {
      try {
        await deleteBuild(id);
        setBuilds(builds.filter(build => build._id !== id));
      } catch (err) {
        setError('Failed to delete build');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">My Saved Builds</h3>
          <div className="mt-3 sm:mt-0 sm:ml-4">
            <Link
              to="/editor"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Create New Build
            </Link>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {builds.length === 0 ? (
          <div className="py-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No builds</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new build.</p>
            <div className="mt-6">
              <Link
                to="/editor"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                New Build
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {builds.map((build) => (
              <div
                key={build._id}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex flex-col space-y-3 hover:border-gray-400"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{build.name}</h3>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(build.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Blocks: {build.blocks.length}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleLoadBuild(build._id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBuild(build._id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedBuilds; 