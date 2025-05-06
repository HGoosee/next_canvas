
import React, { useContext, useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import { CanvasContext } from '../context/CanvasContext';
import ShapeElement from './elements/ShapeElement';
import ImageElement from './elements/ImageElement';
import TextElement from './elements/TextElement';
import undoSvg from '@assets/undo.svg';
import redoSvg from '@assets/redo.svg';
import TRANSFORMER_CONFIG from '../config/config';

const CanvasContainer = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
  background-color: #ffffff; 
  margin-left: 60px; 
`;


const ActionButtons = styled.div`
  position: absolute;
  bottom: 20px;
  right: 220px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 6px;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #f5f5f5;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
    pointer-events: none;
  }
  
  img {
    width: 16px;
    height: 16px;
    filter: invert(0.3); 
    user-select: none;
  }
`;


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
    updateElement,
  } = useContext(CanvasContext);

  const stageRef = useRef(null);
  // 添加选择框状态
  const [selectionRect, setSelectionRect] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectionBounds, setSelectionBounds] = useState(null);
  const multiSelectTransformerRef = useRef(null);
  // 定义最小拖拽距离（像素）
  const MIN_DRAG_DISTANCE = 20;

  // 添加静态和动态图层的引用
  const staticLayerRef = useRef(null);
  const dynamicLayerRef = useRef(null);


  useEffect(() => {
    if (staticLayerRef.current && dynamicLayerRef.current) {
      // 确保两个图层都重新渲染
      staticLayerRef.current.batchDraw();
      dynamicLayerRef.current.batchDraw();
      
      // 打印当前图层状态
      console.log('图层更新:', {
        选中元素: selectedElements,
        静态元素数量: elements.filter(el => !selectedElements.includes(el.id)).length,
        动态元素数量: selectedElements.length
      });
    }
  }, [selectedElements, elements]);
  // 优化图层渲染
  useEffect(() => {
    // if (staticLayerRef.current && dynamicLayerRef.current) {
    //   // 批量绘制以提高性能
    //   staticLayerRef.current.batchDraw();
    //   dynamicLayerRef.current.batchDraw();
    // }

        
    // 静态图层可以缓存，因为它们不经常变化
    if (elements.length > 20) { // 当元素较多时才启用缓存
      staticLayerRef.current.cache();
    } else {
      staticLayerRef.current.clearCache();
    }
    
    // 动态图层优化 - 减少不必要的监听事件
    if (selectedElements.length === 0) {
      dynamicLayerRef.current.listening(false); // 没有选中元素时禁用事件监听
    } else {
      dynamicLayerRef.current.listening(true);
    }
    // 批量绘制以提高性能
    staticLayerRef.current.batchDraw();
    dynamicLayerRef.current.batchDraw();
  }, [elements, selectedElements]);

  // 处理鼠标按下事件
  const handleMouseDown = (e) => {
    if (currentTool !== 'select' || e.target !== e.target.getStage()) {
      return;
    }

    const stage = stageRef.current;
    const point = stage.getPointerPosition();

    setStartPoint({
      x: (point.x - position.x) / scale,
      y: (point.y - position.y) / scale
    });
    setIsDragging(false);  // 重置拖拽状态
    clearSelection();  // 清除当前选中状态
  };

  // 处理鼠标移动事件
  const handleMouseMove = () => {
    if (!startPoint || currentTool !== 'select') return;

    const stage = stageRef.current;
    const point = stage.getPointerPosition();

    const currentPoint = {
      x: (point.x - position.x) / scale,
      y: (point.y - position.y) / scale
    };

    // 计算移动距离
    const dx = currentPoint.x - startPoint.x;
    const dy = currentPoint.y - startPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 如果移动距离超过阈值，开始框选
    if (!isDragging && distance > MIN_DRAG_DISTANCE) {
      setIsDragging(true);
      setIsSelecting(true);
    }

    // 只有在实际拖拽时才更新选择框
    if (isDragging) {
      setSelectionRect({
        x: Math.min(startPoint.x, currentPoint.x),
        y: Math.min(startPoint.y, currentPoint.y),
        width: Math.abs(currentPoint.x - startPoint.x),
        height: Math.abs(currentPoint.y - startPoint.y)
      });

      // 检查框选区域内的元素
      const selectedIds = elements.filter(element => {
        return (
          element.x >= Math.min(startPoint.x, currentPoint.x) &&
          element.x + (element.width || 0) <= Math.max(startPoint.x, currentPoint.x) &&
          element.y >= Math.min(startPoint.y, currentPoint.y) &&
          element.y + (element.height || 0) <= Math.max(startPoint.y, currentPoint.y)
        );
      }).map(el => el.id);

      if (selectedIds.length > 0) {
        setSelectedElements(selectedIds);
      }
    }
  };

  // 处理鼠标松开事件
  const handleMouseUp = () => {
    // 获取当前选择框内的元素
    if (!isDragging) {
      // 如果没有拖拽，说明是单击，直接清除选择
      clearSelection();
    }
    else if (selectionRect) {
      // 如果有框选，处理框选的元素
      const selectedIds = elements.filter(element => {
        return (
          element.x >= selectionRect.x &&
          element.x + element.width <= selectionRect.x + selectionRect.width &&
          element.y >= selectionRect.y &&
          element.y + element.height <= selectionRect.y + selectionRect.height
        );
      }).map(el => el.id);

      // 更新选中状态，但不清除已选中的元素
      if (selectedIds.length > 0) {
        setSelectedElements(selectedIds);
      }
    }
    setIsDragging(false);
    setIsSelecting(false);
    setSelectionRect(null);
    setStartPoint(null);
  };




  // 添加多选变换器的效果
  useEffect(() => {
    if (selectedElements.length > 1 && multiSelectTransformerRef.current) {
      const nodes = selectedElements.map(id => {
        const element = elements.find(el => el.id === id);
        return stageRef.current.findOne(`#${element.id}`);
      }).filter(Boolean);

      multiSelectTransformerRef.current.nodes(nodes);
      multiSelectTransformerRef.current.getLayer().batchDraw();

      // 添加变换结束事件处理
      const transformer = multiSelectTransformerRef.current;
      transformer.on('transformend', (e) => {
        const scaleX = transformer.scaleX();
        const scaleY = transformer.scaleY();
        const rotation = transformer.rotation();

        // 更新所有选中元素
        selectedElements.forEach(id => {
          const element = elements.find(el => el.id === id);
          const node = stageRef.current.findOne(`#${element.id}`);

          if (node) {
            const newWidth = Math.max(20, element.width * scaleX);
            const newHeight = Math.max(20, element.height * scaleY);

            updateElement(id, {
              width: newWidth,
              height: newHeight,
              rotation: rotation || 0,
              x: node.x(),
              y: node.y()
            });
          }
        });

        // 重置变换器的缩放
        transformer.scaleX(1);
        transformer.scaleY(1);
      });
    }
  }, [selectedElements, elements, updateElement]);

  // 计算选中元素的边界
  useEffect(() => {
    if (selectedElements.length > 1) {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      selectedElements.forEach(id => {
        const element = elements.find(el => el.id === id);
        if (element) {
          const x = element.x;
          const y = element.y;
          const width = element.width || 0;
          const height = element.height || 0;

          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x + width);
          maxY = Math.max(maxY, y + height);
        }
      });

      if (minX !== Infinity) {
        setSelectionBounds({
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY
        });
      }
    } else {
      setSelectionBounds(null);
    }
  }, [selectedElements, elements]);



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


  // 渲染元素的函数，根据是否选中分配到不同图层
  const renderStaticElements = () => {
      // 强制静态图层重新渲染
    if (staticLayerRef.current) {
      staticLayerRef.current.batchDraw();
    }
    return elements
      .filter(element => !selectedElements.includes(element.id))
      .map(element => {
        return renderElement(element, false);
      });
  };

  const renderDynamicElements = () => {

    return elements
      .filter(element => selectedElements.includes(element.id))
      .map(element => {
        return renderElement(element, true);
      });
  };
  // 渲染单个元素的辅助函数
  const renderElement = (element, isInDynamicLayer) => {
    const isSelected = selectedElements.includes(element.id);
    const isMultiSelect = selectedElements.length > 1;

    // 只在动态图层中的元素显示变换器
    const showTransformer = isSelected && isInDynamicLayer;

    switch (element.type) {
      case 'shape':
        return (
          <ShapeElement
            key={element.id}
            element={{ ...element, id: `${element.id}` }}
            isSelected={showTransformer}
            isMultiSelect={isMultiSelect}
            currentTool={currentTool}
          />
        );
      case 'image':
        return (
          <ImageElement
            key={element.id}
            element={{ ...element, id: `${element.id}` }}
            isSelected={showTransformer}
            isMultiSelect={isMultiSelect}
            currentTool={currentTool}
          />
        );
      case 'text':
        return (
          <TextElement
            key={element.id}
            element={{ ...element, id: `${element.id}` }}
            isSelected={showTransformer}
            isMultiSelect={isMultiSelect}
            currentTool={currentTool}
          />
        );
      default:
        return null;
    }
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
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [deleteSelectedElements, handleUndo, handleRedo]);

  return (
    <CanvasContainer
      style={{ cursor: currentTool === 'hand' ? 'grab' : 'default' }}
    >
      {/* redo undo  */}
      <ActionButtons>
        <ActionButton
          onClick={handleUndo}
          disabled={currentIndex <= 0}
          title="撤销"
        >
          <img src={undoSvg} />

        </ActionButton>
        <ActionButton
          onClick={handleRedo}
          disabled={currentIndex >= history.length - 1}
          title="重做"
        >
          <img src={redoSvg} />
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
        {/* 静态图层 - 存放未选中的元素 */}
        <Layer listening={true} ref={staticLayerRef} clearBeforeDraw={true} >
          {renderStaticElements()}
        </Layer>
        <Layer listening={true} ref={dynamicLayerRef} clearBeforeDraw={true}>
          {/* 渲染元素 */}
          {/* {elements.map(element => {
            const isSelected = selectedElements.includes(element.id);
            // 多选时不显示单个元素的变换器
            const showTransformer = isSelected;
            const isMultiSelect = selectedElements.length > 1;
            switch (element.type) {
              case 'shape':
                return (
                  <ShapeElement
                    key={element.id}
                    element={{ ...element, id: `${element.id}` }}
                    isSelected={showTransformer}
                    isMultiSelect={isMultiSelect}
                    currentTool={currentTool}
                  />
                );
              case 'image':
                return (
                  <ImageElement
                    key={element.id}
                    element={{ ...element, id: `${element.id}` }}
                    isSelected={showTransformer}
                    isMultiSelect={isMultiSelect}
                    currentTool={currentTool}
                  />
                );
              case 'text':
                return (
                  <TextElement
                    key={element.id}
                    element={{ ...element, id: `${element.id}` }}
                    isSelected={showTransformer}
                    isMultiSelect={isMultiSelect}
                    currentTool={currentTool}
                  />
                );
              default:
                return null;
            }
          })} */}
          {renderDynamicElements()}
          {/* 添加多选变换器 */}
          {selectedElements.length > 1 && (
            <Transformer
              ref={multiSelectTransformerRef}
              {...TRANSFORMER_CONFIG}
              borderDash={[2, 2]}
              borderStrokeWidth={2}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 20 || newBox.height < 20) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>
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
        <ZoomButton
          onClick={handleZoomOut}
          title='缩小'
        >-</ZoomButton>
        <ZoomText>{Math.round(scale * 100)}%</ZoomText>
        <ZoomButton
          onClick={handleZoomIn}
          title='放大'
        >+</ZoomButton>
        <ZoomButton
          onClick={handleZoomReset}
          title='重置缩放'
        >↺</ZoomButton>
      </ZoomControls>

    </CanvasContainer>
  );
};

export default Canvas;
