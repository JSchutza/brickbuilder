import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useEditorStore } from './editorStore';

const GRID_SIZE = 20;
const BRICK_HEIGHT = GRID_SIZE * 0.5; // Standard height of a brick

const Canvas3D = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const meshesRef = useRef({});
  const gridRef = useRef(null);
  const [debugInfo, setDebugInfo] = useState({ 
    blocks: 0, 
    mode: '3D', 
    gridFound: false,
    mousePosition: { x: 0, z: 0 },
    hovering: false
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const hoveredPositionRef = useRef(null);
  
  // Track highest position at each grid cell
  const heightMapRef = useRef({});

  const { 
    blocks, 
    selectedBlock, 
    mode, 
    activeColor,
    activeBlockType,
    addBlock,
    selectBlock,
    updateBlock,
    deleteBlock
  } = useEditorStore();

  // Initialize the height map based on blocks
  useEffect(() => {
    const heightMap = {};
    
    // Process blocks to build height map
    blocks.forEach(block => {
      const { x, y, z = 0, type } = block;
      const [width, height] = type.split('x').map(Number);
      
      // Update height for each grid cell this block occupies
      for (let dx = 0; dx < width; dx++) {
        for (let dy = 0; dy < height; dy++) {
          const key = `${x + dx},${y + dy}`;
          const currentHeight = heightMap[key] || 0;
          const blockHeight = z + 1; // z is the number of blocks beneath this one
          heightMap[key] = Math.max(currentHeight, blockHeight);
        }
      }
    });
    
    heightMapRef.current = heightMap;
    console.log("Canvas3D - Height map updated:", heightMap);
  }, [blocks]);

  // Add debug logging
  useEffect(() => {
    console.log("Canvas3D - Current state:", { 
      blocksCount: blocks.length, 
      mode, 
      selectedBlockId: selectedBlock?.id 
    });
    setDebugInfo(prev => ({ ...prev, blocks: blocks.length, mode }));
  }, [blocks, mode, selectedBlock]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    console.log("Canvas3D - Initializing Three.js scene");

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Create camera
    const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    camera.position.set(100, 100, 50);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 100);
    scene.add(directionalLight);

    // Create grid
    const gridSize = 500;
    const gridDivisions = 45;
    const grid = new THREE.GridHelper(gridSize, gridDivisions, 0x808080, 0x323533);
    scene.add(grid);
    gridRef.current = grid;
    
    // Create a plane for the grid to detect raycaster intersections
    const gridPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(gridSize, gridSize),
      new THREE.MeshBasicMaterial({ 
        visible: false // Make it invisible but still detectable by raycaster
      })
    );
    gridPlane.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    gridPlane.position.y = 0; // Place at y=0
    gridPlane.name = "gridPlane"; // Give it a name for easy reference
    scene.add(gridPlane);

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;
    controlsRef.current = controls;

    // Add position indicator for block placement preview
    const positionIndicator = new THREE.Mesh(
      new THREE.BoxGeometry(GRID_SIZE, BRICK_HEIGHT, GRID_SIZE),
      new THREE.MeshBasicMaterial({ 
        color: 0x00ff00,
        transparent: true,
        opacity: 0.3
      })
    );
    positionIndicator.position.y = 0.5; // Just above the grid
    positionIndicator.visible = false;
    positionIndicator.name = "positionIndicator";
    scene.add(positionIndicator);

    console.log("Canvas3D - Scene setup complete");

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      console.log("Canvas3D - Resize event:", { width, height });
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      console.log("Canvas3D - Cleaning up scene");
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  // Update blocks in the scene
  useEffect(() => {
    if (!sceneRef.current) return;
    
    console.log("Canvas3D - Updating blocks:", { 
      blockCount: blocks.length,
      existingMeshes: Object.keys(meshesRef.current).length
    });
    
    // Keep track of block IDs to remove blocks that no longer exist
    const currentIds = new Set(blocks.map(block => block.id));
    const scene = sceneRef.current;
    
    // Remove blocks that don't exist anymore
    Object.keys(meshesRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        console.log(`Canvas3D - Removing block with ID: ${id}`);
        scene.remove(meshesRef.current[id]);
        delete meshesRef.current[id];
      }
    });
    
    // Add or update blocks
    blocks.forEach(block => {
      const { id, x, y, z = 0, type, color, rotation = 0 } = block;
      const [width, height] = type.split('x').map(Number);
      
      let mesh = meshesRef.current[id];
      
      // Create new mesh if it doesn't exist
      if (!mesh) {
        console.log(`Canvas3D - Creating new block:`, block);
        
        // Create brick geometry
        const geometry = new THREE.BoxGeometry(
          width * GRID_SIZE, 
          BRICK_HEIGHT, // height of the brick
          height * GRID_SIZE
        );
        
        // Create material with block color
        const material = new THREE.MeshPhongMaterial({ color: new THREE.Color(color) });
        
        // Create mesh
        mesh = new THREE.Mesh(geometry, material);
        meshesRef.current[id] = mesh;
        scene.add(mesh);
      } else {
        // Update material color if changed
        if (mesh.material.color.getHexString() !== color.substring(1)) {
          console.log(`Canvas3D - Updating block color:`, { id, oldColor: mesh.material.color.getHexString(), newColor: color });
          mesh.material.color.set(color);
        }
      }
      
      // Position the brick
      // We offset y to place the brick on the grid at appropriate height
      mesh.position.set(
        x * GRID_SIZE + (width * GRID_SIZE / 2), 
        z * BRICK_HEIGHT + (BRICK_HEIGHT / 2), // Stack based on z value
        y * GRID_SIZE + (height * GRID_SIZE / 2)
      );
      
      // Apply rotation (convert degrees to radians)
      mesh.rotation.y = rotation * Math.PI / 180;
      
      // Add studs to the brick
      if (!mesh.userData.studsAdded) {
        for (let sx = 0; sx < width; sx++) {
          for (let sz = 0; sz < height; sz++) {
            const studGeometry = new THREE.CylinderGeometry(
              GRID_SIZE * 0.2, // top radius
              GRID_SIZE * 0.2, // bottom radius
              GRID_SIZE * 0.2, // height
              16 // number of segments
            );
            
            const studMaterial = new THREE.MeshPhongMaterial({ 
              color: new THREE.Color(color).multiplyScalar(0.9) // slightly darker
            });
            
            const stud = new THREE.Mesh(studGeometry, studMaterial);
            
            // Position stud on top of the brick
            stud.position.set(
              (sx * GRID_SIZE) - (width * GRID_SIZE / 2) + (GRID_SIZE / 2),
              BRICK_HEIGHT / 2 + (GRID_SIZE * 0.1), // position on top of the brick
              (sz * GRID_SIZE) - (height * GRID_SIZE / 2) + (GRID_SIZE / 2)
            );
            
            mesh.add(stud);
          }
        }
        mesh.userData.studsAdded = true;
        console.log(`Canvas3D - Added studs to block:`, { id, width, height });
      }
    });
  }, [blocks]);

  // Gets the height (in z units) for a given grid position
  const getHeightAtPosition = (x, y) => {
    return heightMapRef.current[`${x},${y}`] || 0;
  };

  // Handle mouse move to show position indicator
  const handleMouseMove = (e) => {
    if (!sceneRef.current || !cameraRef.current) return;
    
    // Update mouse position state
    setMousePosition({ x: e.clientX, y: e.clientY });
    
    // Cast ray to grid plane or existing blocks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // Calculate mouse position in normalized device coordinates
    const rect = containerRef.current.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Set the raycaster
    raycaster.setFromCamera(mouse, cameraRef.current);
    
    // First check if we're hovering over any existing blocks
    const blockMeshes = Object.values(meshesRef.current);
    const blockIntersects = raycaster.intersectObjects(blockMeshes);
    
    if (blockIntersects.length > 0) {
      // We hit a block, so place above it
      const hitPoint = blockIntersects[0].point;
      
      // Get the clicked block
      const hitBlockMesh = blockIntersects[0].object;
      let hitBlockData = null;
      
      // Find the block data from the mesh
      for (const [id, mesh] of Object.entries(meshesRef.current)) {
        if (mesh === hitBlockMesh) {
          hitBlockData = blocks.find(block => block.id === id);
          break;
        }
      }
      
      if (hitBlockData) {
        // Convert to grid coordinates
        const gridX = Math.floor(hitPoint.x / GRID_SIZE);
        const gridZ = Math.floor(hitPoint.z / GRID_SIZE);
        
        // Determine which face was hit (top, side, etc)
        const hitNormal = blockIntersects[0].face.normal.clone();
        hitNormal.applyQuaternion(hitBlockMesh.quaternion);
        
        let newBlockX = gridX;
        let newBlockY = gridZ;
        let newBlockZ = hitBlockData.z + 1; // Default to stacking on top
        
        // If we hit the side of a block, place next to it, not on top
        if (Math.abs(hitNormal.y) < 0.5) {
          // Side hit - determine direction
          if (Math.abs(hitNormal.x) > Math.abs(hitNormal.z)) {
            // Hit on X axis
            newBlockX = hitNormal.x > 0 ? gridX + 1 : gridX - 1;
            newBlockZ = getHeightAtPosition(newBlockX, newBlockY);
          } else {
            // Hit on Z axis
            newBlockY = hitNormal.z > 0 ? gridZ + 1 : gridZ - 1;
            newBlockZ = getHeightAtPosition(newBlockX, newBlockY);
          }
        }
        
        // Update hover position
        hoveredPositionRef.current = { x: newBlockX, y: newBlockY, z: newBlockZ };
        
        // Update indicator position
        updatePositionIndicator(newBlockX, newBlockY, newBlockZ);
        
        setDebugInfo(prev => ({ 
          ...prev, 
          mousePosition: { x: newBlockX, y: newBlockY, z: newBlockZ },
          hovering: true,
          hoverType: 'block'
        }));
        
        return;
      }
    }
    
    // If we didn't hit a block, check for ground plane intersection
    const gridPlane = sceneRef.current.children.find(child => child.name === "gridPlane");
    if (!gridPlane) return;
    
    const groundIntersects = raycaster.intersectObject(gridPlane);
    
    if (groundIntersects.length > 0) {
      const point = groundIntersects[0].point;
      const gridX = Math.floor(point.x / GRID_SIZE);
      const gridZ = Math.floor(point.z / GRID_SIZE);
      
      // Look up the height at this position
      const gridHeight = getHeightAtPosition(gridX, gridZ);
      
      hoveredPositionRef.current = { x: gridX, y: gridZ, z: gridHeight };
      
      // Update indicator
      updatePositionIndicator(gridX, gridZ, gridHeight);
      
      setDebugInfo(prev => ({ 
        ...prev, 
        mousePosition: { x: gridX, y: gridZ, z: gridHeight },
        hovering: true,
        hoverType: 'ground'
      }));
    } else {
      // Hide indicator if no intersection
      const positionIndicator = sceneRef.current.children.find(child => child.name === "positionIndicator");
      if (positionIndicator) {
        positionIndicator.visible = false;
      }
      
      hoveredPositionRef.current = null;
      setDebugInfo(prev => ({ ...prev, hovering: false }));
    }
  };
  
  // Helper to update the position indicator
  const updatePositionIndicator = (gridX, gridY, gridZ) => {
    const positionIndicator = sceneRef.current.children.find(child => child.name === "positionIndicator");
    if (!positionIndicator) return;
    
    // Get block dimensions
    const [width, height] = activeBlockType.split('x').map(Number);
    
    // Update size based on active block type
    positionIndicator.scale.set(width, 1, height);
    
    // Update position (center of the grid cell)
    positionIndicator.position.set(
      gridX * GRID_SIZE + (width * GRID_SIZE / 2), 
      gridZ * BRICK_HEIGHT + (BRICK_HEIGHT / 2), // Position at the correct height
      gridY * GRID_SIZE + (height * GRID_SIZE / 2)
    );
    
    // Show indicator
    positionIndicator.visible = true;
    
    // Update material color based on active color
    positionIndicator.material.color.set(new THREE.Color(activeColor));
    positionIndicator.material.opacity = 0.5;
  };

  // Handle key presses for shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      console.log("Canvas3D - Key press:", e.key);
      
      // Handle 'P' key for placing a block at current mouse position
      if (e.key === 'p' || e.key === 'P') {
        if (hoveredPositionRef.current) {
          const { x, y, z } = hoveredPositionRef.current;
          
          // Create new block
          const newBlock = {
            id: Math.random().toString(36).substr(2, 9),
            x, y, z,
            color: activeColor,
            type: activeBlockType,
            rotation: 0
          };
          
          console.log("Canvas3D - Adding block with P key:", newBlock);
          addBlock(newBlock);
          selectBlock(newBlock.id);
        }
      }
      
      // Handle block manipulation if there's a selected block
      if (selectedBlock) {
        if (e.key === 'r' || e.key === 'R') {
          // Rotate block
          updateBlock(selectedBlock.id, {
            rotation: (selectedBlock.rotation + 90) % 360
          });
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          // Delete block
          deleteBlock(selectedBlock.id);
        } else if (e.key === 'PageUp') {
          // Move block up in z-axis
          updateBlock(selectedBlock.id, {
            z: (selectedBlock.z || 0) + 1
          });
        } else if (e.key === 'PageDown') {
          // Move block down in z-axis (if not at ground)
          if ((selectedBlock.z || 0) > 0) {
            updateBlock(selectedBlock.id, {
              z: (selectedBlock.z || 0) - 1
            });
          }
        }
        
        // Move block in x and y axis
        const step = e.shiftKey ? 5 : 1;
        let deltaX = 0;
        let deltaY = 0;
        
        if (e.key === 'ArrowLeft') deltaX = -step;
        if (e.key === 'ArrowRight') deltaX = step;
        if (e.key === 'ArrowUp') deltaY = -step;
        if (e.key === 'ArrowDown') deltaY = step;
        
        if (deltaX !== 0 || deltaY !== 0) {
          updateBlock(selectedBlock.id, {
            x: selectedBlock.x + deltaX,
            y: selectedBlock.y + deltaY
          });
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedBlock, activeColor, activeBlockType, addBlock, selectBlock, updateBlock, deleteBlock]);

  // Add click event handling for block placement
  const handleMouseDown = (e) => {
    console.log("Canvas3D - Mouse down event:", { 
      button: e.button, 
      clientX: e.clientX, 
      clientY: e.clientY,
      shiftKey: e.shiftKey 
    });
    
    if (e.button !== 0 || e.shiftKey) return; // Only handle left-click without shift
    
    if (!sceneRef.current || !cameraRef.current) {
      console.log("Canvas3D - Scene or camera not initialized");
      return;
    }

    // Use the hoveredPosition that is already detected by mouse move
    if (hoveredPositionRef.current) {
      const { x, y, z } = hoveredPositionRef.current;
      
      // Create new block
      const newBlock = {
        id: Math.random().toString(36).substr(2, 9),
        x, y, z,
        color: activeColor,
        type: activeBlockType,
        rotation: 0
      };
      
      console.log("Canvas3D - Adding new block:", newBlock);
      addBlock(newBlock);
      selectBlock(newBlock.id);
    } else {
      console.log("Canvas3D - No valid position for block placement");
    }
  };

  return (
    <div className="w-full h-full relative bg-transparent">
      <div 
        className="w-full h-full" 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        {/* <h1 className="text-2xl font-bold">3D View</h1> */}
      </div>
      {/* <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 text-xs">
        Debug: {JSON.stringify(debugInfo)}
      </div> */}
      
    </div>
  );
};

export default Canvas3D; 