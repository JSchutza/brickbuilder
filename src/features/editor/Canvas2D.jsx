import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from './editorStore';
import { v4 as uuidv4 } from 'uuid';

const GRID_SIZE = 20;
const COLORS = {
  grid: '#e5e7eb',
  selection: '#3b82f6',
};

const Canvas2D = () => {
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  
  const {
    blocks,
    selectedBlock,
    activeColor,
    activeBlockType,
    addBlock,
    selectBlock,
    clearSelection,
    updateBlock,
    deleteBlock
  } = useEditorStore();

  // Handle canvas resizing
  useEffect(() => {
    const handleResize = () => {
      const container = canvasRef.current.parentElement;
      setCanvasSize({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Draw the canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Apply transformations
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);
    
    // Draw grid
    drawGrid(ctx);
    
    // Draw blocks
    blocks.forEach(block => {
      drawBlock(ctx, block);
    });
    
    // Highlight selected block
    if (selectedBlock) {
      highlightBlock(ctx, selectedBlock);
    }
    
    ctx.restore();
  }, [blocks, selectedBlock, offset, scale, canvasSize]);

  const drawGrid = (ctx) => {
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    
    const offsetX = (offset.x % (GRID_SIZE * scale)) / scale;
    const offsetY = (offset.y % (GRID_SIZE * scale)) / scale;
    
    const startX = -offsetX;
    const startY = -offsetY;
    const endX = canvasSize.width / scale;
    const endY = canvasSize.height / scale;
    
    // Draw vertical lines
    for (let x = startX; x < endX; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = startY; y < endY; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
  };

  const drawBlock = (ctx, block) => {
    const { x, y, color, type, rotation = 0 } = block;
    const [width, height] = parseBlockType(type);
    
    ctx.save();
    
    // Translate to block position
    ctx.translate(x * GRID_SIZE, y * GRID_SIZE);
    
    // Apply rotation
    if (rotation) {
      ctx.translate(width * GRID_SIZE / 2, height * GRID_SIZE / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-width * GRID_SIZE / 2, -height * GRID_SIZE / 2);
    }
    
    // Draw block
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width * GRID_SIZE, height * GRID_SIZE);
    
    // Draw block outline
    ctx.strokeStyle = darkenColor(color, 20);
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width * GRID_SIZE, height * GRID_SIZE);
    
    // Draw block studs
    drawStuds(ctx, width, height, color);
    
    ctx.restore();
  };

  const drawStuds = (ctx, width, height, color) => {
    const studRadius = GRID_SIZE / 4;
    ctx.fillStyle = darkenColor(color, 10);
    
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        ctx.beginPath();
        ctx.arc(
          x * GRID_SIZE + GRID_SIZE / 2,
          y * GRID_SIZE + GRID_SIZE / 2,
          studRadius,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  };

  const highlightBlock = (ctx, block) => {
    const { x, y, type, rotation = 0 } = block;
    const [width, height] = parseBlockType(type);
    
    ctx.save();
    
    // Translate to block position
    ctx.translate(x * GRID_SIZE, y * GRID_SIZE);
    
    // Apply rotation
    if (rotation) {
      ctx.translate(width * GRID_SIZE / 2, height * GRID_SIZE / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-width * GRID_SIZE / 2, -height * GRID_SIZE / 2);
    }
    
    // Draw selection outline
    ctx.strokeStyle = COLORS.selection;
    ctx.lineWidth = 2;
    ctx.strokeRect(-2, -2, width * GRID_SIZE + 4, height * GRID_SIZE + 4);
    
    ctx.restore();
  };

  const parseBlockType = (type) => {
    const [width, height] = type.split('x').map(Number);
    return [width, height];
  };

  const darkenColor = (hex, percent) => {
    // Convert hex to RGB
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);
    
    // Darken
    r = Math.floor(r * (100 - percent) / 100);
    g = Math.floor(g * (100 - percent) / 100);
    b = Math.floor(b * (100 - percent) / 100);
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / scale - offset.x / scale;
    const mouseY = (e.clientY - rect.top) / scale - offset.y / scale;
    
    // Check if clicked on a block
    const clickedBlock = findBlockAtPosition(mouseX, mouseY);
    
    if (e.button === 0) { // Left click
      if (e.shiftKey) {
        // Start panning
        setIsPanning(true);
        setPanStart({ x: e.clientX, y: e.clientY });
      } else if (clickedBlock) {
        // Select block
        selectBlock(clickedBlock.id);
      } else {
        // Place new block
        const gridX = Math.floor(mouseX / GRID_SIZE);
        const gridY = Math.floor(mouseY / GRID_SIZE);
        
        const newBlock = {
          id: uuidv4(),
          x: gridX,
          y: gridY,
          z: 0,
          color: activeColor,
          type: activeBlockType,
          rotation: 0
        };
        
        addBlock(newBlock);
        selectBlock(newBlock.id);
      }
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setOffset({
        x: offset.x + (e.clientX - panStart.x),
        y: offset.y + (e.clientY - panStart.y)
      });
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    
    const delta = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(Math.max(scale * delta, 0.1), 5);
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate new offset to zoom towards mouse position
    const newOffset = {
      x: mouseX - (mouseX - offset.x) * (newScale / scale),
      y: mouseY - (mouseY - offset.y) * (newScale / scale)
    };
    
    setScale(newScale);
    setOffset(newOffset);
  };

  const findBlockAtPosition = (x, y) => {
    // Check in reverse order (top blocks first)
    for (let i = blocks.length - 1; i >= 0; i--) {
      const block = blocks[i];
      const [width, height] = parseBlockType(block.type);
      
      // Apply rotation
      if (block.rotation % 180 === 90) {
        // Swap width and height for 90/270 degree rotations
        if (
          x >= block.x * GRID_SIZE &&
          x <= block.x * GRID_SIZE + height * GRID_SIZE &&
          y >= block.y * GRID_SIZE &&
          y <= block.y * GRID_SIZE + width * GRID_SIZE
        ) {
          return block;
        }
      } else {
        if (
          x >= block.x * GRID_SIZE &&
          x <= block.x * GRID_SIZE + width * GRID_SIZE &&
          y >= block.y * GRID_SIZE &&
          y <= block.y * GRID_SIZE + height * GRID_SIZE
        ) {
          return block;
        }
      }
    }
    return null;
  };

  const handleKeyDown = (e) => {
    if (!selectedBlock) return;
    
    if (e.key === 'Delete' || e.key === 'Backspace') {
      deleteBlock(selectedBlock.id);
    } else if (e.key === 'r') {
      // Rotate block
      updateBlock(selectedBlock.id, {
        rotation: (selectedBlock.rotation + 90) % 360
      });
    } else if (e.key === 'Escape') {
      clearSelection();
    }
    
    // Move block
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
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedBlock]);

  return (
    <div className="w-full h-full overflow-hidden bg-gray-100">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        tabIndex={0}
      />
    </div>
  );
};

export default Canvas2D; 