import React, { useContext, useRef, useState, useEffect } from 'react';
import { Image, Group, Transformer } from 'react-konva';
import { CanvasContext } from '../../context/CanvasContext';
import TRANSFORMER_CONFIG from '../../config/config.jsx'

const ImageElement = ({ element, isSelected, isMultiSelect, currentTool }) => {
  const { selectElement, updateElement } = useContext(CanvasContext);
  const imageRef = useRef(null);
  const groupRef = useRef(null);
  const transformerRef = useRef(null);
  const [image, setImage] = useState(null);
  
  // 加载图片
  useEffect(() => {
    const img = new window.Image();
    img.src = element.src;
    img.onload = () => {
      setImage(img);
    };
  }, [element.src]);
  
  // 设置变换器
  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();

      // 多选时隐藏锚点
      if (isMultiSelect) {
        transformerRef.current.enabledAnchors([]);
        transformerRef.current.rotateEnabled(false);
      } else {
        transformerRef.current.enabledAnchors(['top-left', 'top-right', 'bottom-left', 'bottom-right']);
        transformerRef.current.rotateEnabled(true);
      }
    }
  }, [isSelected, isMultiSelect]);
  
  const handleSelect = (e) => {

    e.cancelBubble = true;
    
    if (!isSelected) {
      selectElement(element.id, e.evt.shiftKey);
    }
  };
  
  const handleDragStart = (e) => {

    e.cancelBubble = true;
    if (!isSelected) {
      selectElement(element.id, e.evt.shiftKey);
    }
  };
  
  const handleDragEnd = (e) => {

    e.cancelBubble = true;
    
    updateElement(element.id, {
      x: e.target.x(),
      y: e.target.y()
    });
  };
  
  const handleMouseDown = (e) => {
    e.cancelBubble = true;
    const stage = e.target.getStage();
    stage.container().style.cursor = 'move';
  };

  const handleMouseUp = (e) => {
    e.cancelBubble = true;
    const stage = e.target.getStage();
    stage.container().style.cursor = 'default';
  };

  const handleTransformEnd = (e) => {
    const node = groupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();
    
    // 先计算新的宽高
    const width = Math.max(20, element.width * scaleX);
    const height = Math.max(20, element.height * scaleY);
    
    // 重置缩放，但保留旋转
    node.scaleX(1);
    node.scaleY(1);
    
    // 更新元素属性
    updateElement(element.id, {
      x: node.x(),
      y: node.y(),
      width: width,
      height: height,
      rotation: rotation
    });
  };
  
  return (
    <>
      <Group
        id={`${element.id}`}  // 添加 id 属性
        ref={groupRef}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation || 0}
        draggable={currentTool === 'select'}
        onClick={handleSelect}
        onTap={handleSelect}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <Image
          ref={imageRef}
          image={image}
          width={element.width}
          height={element.height}
          perfectDrawEnabled={true}
        />
      </Group>
      {isSelected && currentTool === 'select' && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // 限制最小尺寸
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
          {...TRANSFORMER_CONFIG}
          onTransformEnd={handleTransformEnd}
        />
      )}
    </>
  );
};

export default ImageElement;