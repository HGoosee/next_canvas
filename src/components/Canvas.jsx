
import React, { useContext, useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Stage, Layer,Rect } from 'react-konva';
import { CanvasContext } from '../context/CanvasContext';
import ShapeElement from './elements/ShapeElement';
import ImageElement from './elements/ImageElement';
import TextElement from './elements/TextElement';
import undoSvg from '@assets/undo.svg';
import redoSvg from '@assets/redo.svg';

const CanvasContainer = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
  background-color: #ffffff; /* 修改为纯白色背景 */
  margin-left: 60px; /* 为左侧工具栏留出空间 */
`;




//撤销与反撤销
const ActionButtons = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
`;

const ActionButton = styled.button`
  margin: 0 5px;
  padding: 8px 10px;
  background: #2c2c2c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  img {
  width: 16px;
  height: 16px;
  filter: invert(1);
  }
`;

// 在文件顶部添加样式组件
const ZoomControls = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 6px;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ZoomButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  
  &:hover {
    background: #f5f5f5;
  }
`;

const ZoomText = styled.div`
  padding: 0 8px;
  font-size: 14px;
  color: #333;
  min-width: 60px;
  text-align: center;
`;

// 添加选择框样式组件
const SelectionRect = styled.div`
  position: absolute;
  border: 1px solid #00a0ff;
  background-color: rgba(0, 160, 255, 0.1);
  pointer-events: none;
`;

const Canvas = () => {
  const {
    scale,
    setScale,
    position,
    setPosition,
    elements,
    selectedElements,
    clearSelection,
    currentTool,
    setSelectedElements,
    deleteSelectedElements, 
    //deleteElements,
    history,
    currentIndex,
    handleUndo,
    handleRedo,
  } = useContext(CanvasContext);
  
  const stageRef = useRef(null);

   // 添加选择框状态
   const [selectionRect, setSelectionRect] = useState(null);
   const [isSelecting, setIsSelecting] = useState(false);
   const [startPoint, setStartPoint] = useState(null);


   // 添加全局鼠标事件监听
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelecting) {
        handleMouseUp();
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isSelecting]); // 依赖项添加 isSelecting

    // 处理鼠标按下事件
   const handleMouseDown = (e) => {
    if (currentTool !== 'select' || e.evt.button !== 0) return;
    
    const stage = stageRef.current;
    const point = stage.getPointerPosition();
    
    // 如果点击到了元素，不启动框选
    if (e.target !== e.target.getStage()) {
      setIsSelecting(false);
      setSelectionRect(null);
      setStartPoint(null);
      return;
    }
    
    setStartPoint({
      x: (point.x - position.x) / scale,
      y: (point.y - position.y) / scale
    });
    setIsSelecting(true);
    setSelectionRect(null);
  };

  // 处理鼠标移动事件
  const handleMouseMove = (e) => {
    if (!isSelecting) return;

    const stage = stageRef.current;
    const point = stage.getPointerPosition();
    
    const currentPoint = {
      x: (point.x - position.x) / scale,
      y: (point.y - position.y) / scale
    };

    setSelectionRect({
      x: Math.min(startPoint.x, currentPoint.x),
      y: Math.min(startPoint.y, currentPoint.y),
      width: Math.abs(currentPoint.x - startPoint.x),
      height: Math.abs(currentPoint.y - startPoint.y)
    });
  };

  // 处理鼠标松开事件
  const handleMouseUp = () => {
    if (!isSelecting) return;

    // 如果有选择框，检查哪些元素在框内
    if (selectionRect) {
      const selectedIds = elements.filter(element => {
        return (
          element.x >= selectionRect.x &&
          element.x + element.width <= selectionRect.x + selectionRect.width &&
          element.y >= selectionRect.y &&
          element.y + element.height <= selectionRect.y + selectionRect.height
        );
      }).map(el => el.id);

      if (selectedIds.length > 0) {
        setSelectedElements(selectedIds);
      } else {
        clearSelection();
      }
    }

    setIsSelecting(false);
    setSelectionRect(null);
    setStartPoint(null);
  };

  



  // 处理鼠标滚轮缩放
  const handleWheel = (e) => {
    // 只有按下 Ctrl 键时才能滚轮缩放
    if (!e.evt.ctrlKey) return;

    e.evt.preventDefault();
    
    const stage = stageRef.current;
    const oldScale = scale;
    
    // 获取鼠标相对于画布的位置
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale
    };
    
    // 计算新的缩放比例
    const scaleBy = 1.1;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    // 限制缩放范围在 0.1 到 5 之间
    const boundedScale = Math.min(Math.max(0.1, newScale), 5);
    
    // 更新位置和缩放，保持鼠标指向的点不变
    setScale(boundedScale);
    setPosition({
      x: pointer.x - mousePointTo.x * boundedScale,
      y: pointer.y - mousePointTo.y * boundedScale
    });
  };

  // 添加缩放控制函数
  const handleZoomIn = () => {
    const newScale = Math.min(5, Math.round((scale + 0.1) * 10) / 10);
    setScale(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(0.1, Math.round((scale - 0.1) * 10) / 10);
    setScale(newScale);
  };

  const handleZoomReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // 处理画布拖拽
  const handleDragMove = (e) => {
    if (currentTool === 'hand') {
      e.evt.preventDefault();
      setPosition({
        x: position.x + e.evt.movementX,
        y: position.y + e.evt.movementY
      });
    }
  };
  
  // 处理画布点击事件
  const handleStageClick = (e) => {
    // 如果点击的是舞台而不是元素，取消选择
    if (e.target === e.currentTarget) {
      clearSelection();
    }
  };
  
  // 渲染元素
  const renderElements = () => {
    return elements.map(element => {
      const isSelected = selectedElements.includes(element.id);
      
      switch (element.type) {
        case 'shape':
          return (
            <ShapeElement 
              key={element.id} 
              element={element} 
              isSelected={isSelected} 
            />
          );
        case 'image':
          return (
            <ImageElement 
              key={element.id} 
              element={element} 
              isSelected={isSelected} 
            />
          );
        case 'text':
          return (
            <TextElement 
              key={element.id} 
              element={element} 
              isSelected={isSelected} 
            />
          );
        default:
          return null;
      }
    });
  };

  // 窗口大小变化时更新画布尺寸
  const [stageSize, setStageSize] = useState({
    width: window.innerWidth - 60,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setStageSize({
        width: window.innerWidth - 60,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 添加键盘事件监听
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && 
          e.target.tagName !== 'INPUT' && 
          e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        deleteSelectedElements();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [deleteSelectedElements]);
  
  return (
    <CanvasContainer 
    style={{ cursor: currentTool === 'hand' ? 'grab' : 'default' }}
    >
      <ActionButtons>
        <ActionButton 
          onClick={handleUndo} 
          disabled={currentIndex <= 0}
        >
          <img src={undoSvg}/> 

        </ActionButton>
        <ActionButton 
          onClick={handleRedo} 
          disabled={currentIndex >= history.length - 1}
        >
          <img src={redoSvg}/> 
        </ActionButton>
      </ActionButtons>
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onClick={handleStageClick}
        onTap={handleStageClick}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable={currentTool === 'hand'}
        onDragMove={handleDragMove}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: currentTool === 'hand' ? 'grab' : 'default' }}
      >
        <Layer>
          {renderElements()}
        </Layer>
      </Stage>

      {/* 渲染选择框 */}
      {/* 渲染选择框 */}
      {selectionRect && (
          <SelectionRect
            style={{
              left: selectionRect.x * scale + position.x,
              top: selectionRect.y * scale + position.y,
              width: selectionRect.width * scale,
              height: selectionRect.height * scale
            }}
          />
        )}

      <ZoomControls>
        <ZoomButton onClick={handleZoomOut}>-</ZoomButton>
        <ZoomText>{Math.round(scale * 100)}%</ZoomText>
        <ZoomButton onClick={handleZoomIn}>+</ZoomButton>
        <ZoomButton onClick={handleZoomReset}>↺</ZoomButton>
      </ZoomControls>
      
    </CanvasContainer>
  );
};

export default Canvas;