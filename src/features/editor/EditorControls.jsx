import { useState, useEffect } from 'react';
import { useEditorStore } from './editorStore';
import { useNavigate } from 'react-router-dom';

const BLOCK_TYPES = ['1x1', '2x1', '2x2', '2x3', '2x4', '1x2', '1x3', '1x4'];

const COLORS = [
  { name: 'Red', value: '#ff0000' },
  { name: 'Blue', value: '#0000ff' },
  { name: 'Green', value: '#00ff00' },
  { name: 'Yellow', value: '#ffff00' },
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#ffffff' },
  { name: 'Orange', value: '#ffa500' },
  { name: 'Purple', value: '#800080' }
];

const EditorControls = () => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [buildName, setBuildName] = useState('');
  const navigate = useNavigate();
  
  const {
    activeColor,
    activeBlockType,
    setActiveColor,
    setActiveBlockType,
    setBuildName: setStoreBuildName,
    buildName: storeBuildName,
    saveBuild,
    newBuild,
    isDirty,
    isLoading,
    error,
    clearError,
    mode,
    setMode
  } = useEditorStore();

  const handleSaveClick = () => {
    setBuildName(storeBuildName);
    setShowSaveModal(true);
  };

  const handleSave = async () => {
    if (!buildName.trim()) {
      alert('Please enter a name for your build');
      return;
    }

    setStoreBuildName(buildName);
    
    try {
      await saveBuild();
      setShowSaveModal(false);
    } catch (err) {
      // Error is already handled in the store
    }
  };

  const handleNewBuild = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to start a new build?')) {
        newBuild();
      }
    } else {
      newBuild();
    }
  };

  const handleViewBuilds = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/builds');
      }
    } else {
      navigate('/builds');
    }
  };

  useEffect(() => {
    console.log("EditorControls - Current mode:", mode);
  }, [mode]);

  return (
    <div className="p-4 bg-white-200 border-1 border-black shadow-lg shadow-black rounded-lg">
      {/* Mode toggle */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('2D')}
            className={`flex-1 py-2 px-3 rounded-md ${
              mode === '2D'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-200'
            }`}
          >
            2D
          </button>
          <button
            onClick={() => setMode('3D')}
            className={`flex-1 py-2 px-3 rounded-md ${
              mode === '3D'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-200'
            }`}
          >
            3D
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 pt-4 bg-white rounded-md shadow-lg shadow-black">
        <h3 className="text-sm font-medium text-gray-700 flex justify-center">Keyboard Controls</h3>
        <ul className="text-xs text-gray-600 space-y-1 m-3">
          <li>• Click: Place or select block</li>
          <li>• R key: Rotate selected block</li>
          <li>• Arrow keys: Move selected block</li>
          <li>• Delete: Remove selected block</li>
          <li>• Shift + Click + Drag: Pan the canvas</li>
          <li>• Mouse wheel: Zoom in/out</li>
        </ul>
        
        
          <div className="mt-4 p-3 bg-white rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">3D Mode Controls</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Left click: Place block on grid or on other blocks</li>
              <li>• Right click + drag: Rotate view</li>
              <li>• Middle mouse/wheel: Zoom in/out</li>
              <li>• Press 'P' key: Place block at cursor</li>
              <li>• PageUp/PageDown: Move selected block up/down</li>
              <li className="font-medium text-green-600">• Mouse over grid or blocks to see placement preview</li>
              <li className="font-medium text-green-600">• Blocks automatically stack on top of each other</li>
            </ul>
          </div>
      </div>

      {/* Block type selector */}
      <div className="mb-8 mt-8 border-1">
        <label className="flex justify-center text-sm font-medium text-gray-700 m-3">Type</label>
        <div className="grid grid-cols-3 gap-4">
          {BLOCK_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setActiveBlockType(type)}
              className={`py-2 px-3 rounded-md border-1 border-black shadow-md shadow-black ${
                activeBlockType === type
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-800 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Color selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
        <div className="grid grid-cols-3 gap-3">
          {COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => setActiveColor(color.value)}
              className={`w-10 h-10 rounded-full border-1 border-black shadow-md shadow-black ${
                activeColor === color.value ? 'border-primary-600' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 space-y-3">
        <button
          onClick={handleSaveClick}
          className="w-full btn btn-primary hover:bg-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Build'}
        </button>
        <button onClick={handleNewBuild} className="w-full btn btn-secondary hover:bg-secondary">
          New Build
        </button>
        <button onClick={handleViewBuilds} className="w-full btn btn-secondary hover:bg-secondary">
          View My Builds
        </button>
      </div>


      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowSaveModal(false)}></div>
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative z-10">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Save Build</h3>
            
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">{error}</span>
                <button
                  className="absolute top-0 bottom-0 right-0 px-4"
                  onClick={clearError}
                >
                  ×
                </button>
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="buildName" className="block text-sm font-medium text-gray-700 mb-1">
                Build Name
              </label>
              <input
                type="text"
                id="buildName"
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
                className="input"
                placeholder="My awesome build"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorControls; 