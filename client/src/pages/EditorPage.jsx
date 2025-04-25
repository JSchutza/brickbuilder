import { useEffect } from 'react';
import { useEditorStore } from '../features/editor/editorStore';
import Canvas2D from '../features/editor/Canvas2D';
import Canvas3D from '../features/editor/Canvas3D';
import EditorControls from '../features/editor/EditorControls';
import LoadingSpinner from '../components/LoadingSpinner';

const EditorPage = () => {
  const { mode, isLoading } = useEditorStore();

  // For the MVP, we'll just implement the 2D editor
  // The 3D editor would be added in the future with Three.js
  
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-white shadow-lg shadow-black border-b border-1 border-black">
        <h1 className="text-xl font-semibold text-gray-900">Brick Editor</h1>
      </div>
      
      <div className="flex flex-1 overflow-hidden bg-white">
        <div className="flex-1 overflow-hidden">
          {mode === '2D' ? (
            <Canvas2D />
          ) : (
            <Canvas3D />
          )}
        </div>
        
        <div className="w-80 flex-shrink-0">
          <EditorControls />
        </div>
      </div>
    </div>
  );
};

export default EditorPage; 