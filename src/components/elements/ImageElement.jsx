import React, { useContext, useRef, useState, useEffect } from 'react';
import { Image, Group, Transformer } from 'react-konva';
import { CanvasContext } from '../../context/CanvasContext';

const ImageElement = ({ element, isSelected }) => {
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
    }
  }, [isSelected]);
  
  const handleSelect = (e) => {
    // 阻止事件冒泡
    e.cancelBubble = true;
    
    if (!isSelected) {
      selectElement(element.id, e.evt.shiftKey);
    }
  };
  
  const handleDragStart = (e) => {
    // 阻止事件冒泡
    e.cancelBubble = true;
  };
  
  const handleDragEnd = (e) => {
    // 阻止事件冒泡
    e.cancelBubble = true;
    
    updateElement(element.id, {
      x: e.target.x(),
      y: e.target.y()
    });
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
        ref={groupRef}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation || 0}
        draggable={true}
        onClick={handleSelect}
        onTap={handleSelect}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Image
          ref={imageRef}
          image={image}
          width={element.width}
          height={element.height}
          perfectDrawEnabled={true}
        />
      </Group>
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // 限制最小尺寸
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
          onTransformEnd={handleTransformEnd}
          rotateEnabled={true}
          rotationSnaps={[0, 90, 180, 270]}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          padding={1}
          keepRatio={true}
          resizeEnabled={true}

        />
      )}
    </>
  );
};

export default ImageElement;