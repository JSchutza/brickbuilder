import { create } from 'zustand';
import * as buildService from '../../services/buildService';

export const useEditorStore = create((set, get) => ({
  blocks: [],
  selectedBlock: null,
  currentBuildId: null,
  buildName: 'Untitled Build',
  activeColor: '#ff0000',
  activeBlockType: '1x1',
  isLoading: false,
  error: null,
  isDirty: false,
  mode: '3D', // '2D' or '3D'
  
  // Block actions
  addBlock: (block) => {
    set((state) => ({ 
      blocks: [...state.blocks, block],
      isDirty: true
    }));
  },
  
  updateBlock: (id, updates) => {
    set((state) => ({
      blocks: state.blocks.map(block => 
        block.id === id ? { ...block, ...updates } : block
      ),
      isDirty: true
    }));
  },
  
  deleteBlock: (id) => {
    set((state) => ({
      blocks: state.blocks.filter(block => block.id !== id),
      selectedBlock: state.selectedBlock?.id === id ? null : state.selectedBlock,
      isDirty: true
    }));
  },
  
  selectBlock: (id) => {
    const blocks = get().blocks;
    const block = blocks.find(b => b.id === id) || null;
    set({ selectedBlock: block });
  },
  
  clearSelection: () => {
    set({ selectedBlock: null });
  },
  
  // Editor settings
  setActiveColor: (color) => {
    set({ activeColor: color });
  },
  
  setActiveBlockType: (blockType) => {
    set({ activeBlockType: blockType });
  },
  
  setBuildName: (name) => {
    set({ buildName: name, isDirty: true });
  },
  
  setMode: (mode) => {
    set({ mode });
  },
  
  // Build management
  loadBuild: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const build = await buildService.getBuildById(id);
      set({ 
        blocks: build.blocks, 
        buildName: build.name, 
        currentBuildId: build._id,
        isLoading: false,
        isDirty: false
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to load build', 
        isLoading: false 
      });
    }
  },
  
  saveBuild: async () => {
    const { blocks, buildName, currentBuildId } = get();
    set({ isLoading: true, error: null });
    
    try {
      let result;
      if (currentBuildId) {
        // Update existing build
        result = await buildService.updateBuild(currentBuildId, {
          name: buildName,
          blocks
        });
      } else {
        // Create new build
        result = await buildService.createBuild({
          name: buildName,
          blocks
        });
      }
      
      set({ 
        currentBuildId: result._id, 
        isLoading: false,
        isDirty: false
      });
      
      return result;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to save build', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  newBuild: () => {
    set({
      blocks: [],
      selectedBlock: null,
      currentBuildId: null,
      buildName: 'Untitled Build',
      isDirty: false
    });
  },
  
  // Clear error
  clearError: () => set({ error: null }),
})); 