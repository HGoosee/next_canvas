import React, { useContext, useRef, useEffect } from 'react';
import { Rect, Circle, RegularPolygon, Star, Line, Group, Transformer } from 'react-konva';
import { CanvasContext } from '../../context/CanvasContext';

const ShapeElement = ({ element, isSelected }) => {
  const { selectElement, updateElement } = useContext(CanvasContext);
  const shapeRef = useRef(null);
  const groupRef = useRef(null);
  const transformerRef = useRef(null);
  
  // 设置变换器
  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      // 将变换器附加到 Group 而不是 Shape
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);
  
  const handleSelect = (e) => {
    // 阻止事件冒泡，防止触发画布的点击事件
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
    
    // 更新元素位置
    updateElement(element.id, {
      x: e.target.x(),
      y: e.target.y()
    });
  };
  
  const handleTransformEnd = (e) => {
    // 获取 Group 节点
    const node = groupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();
    
    // 先计算新的宽高，使用元素原始宽高乘以缩放比例
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
  
  // 根据形状类型渲染不同的图形
  const renderShape = () => {
    const shapeProps = {
      ref: shapeRef,
      width: element.width,
      height: element.height,
      fill: element.fill || '#ffffff',
      stroke: element.stroke || '#000000',
      strokeWidth: element.strokeWidth || 1,
      // 移除 Shape 的 draggable 和事件处理
      perfectDrawEnabled: true
    };
    
    switch (element.shapeType) {
      case 'rectangle':
        return <Rect {...shapeProps} />;
        
      case 'roundedRectangle':
        return <Rect {...shapeProps} cornerRadius={element.cornerRadius || 10} />;
        
      case 'circle':
        return (
          <Circle 
            {...shapeProps}
            radius={Math.min(element.width, element.height) / 2}
          />
        );
        
      case 'ellipse':
        return (
          <Rect 
            {...shapeProps}
            cornerRadius={[element.width / 2, element.height / 2, element.width / 2, element.height / 2]}
          />
        );
        
      case 'triangle':
        return (
          <RegularPolygon
            {...shapeProps}
            sides={3}
            radius={Math.min(element.width, element.height) / 2}
          />
        );
        
      case 'diamond':
        return (
          <RegularPolygon
            {...shapeProps}
            sides={4}
            radius={Math.min(element.width, element.height) / 1.414}
            //rotation={45}
          />
        );
        
      case 'pentagon':
        return (
          <RegularPolygon
            {...shapeProps}
            sides={5}
            radius={Math.min(element.width, element.height) / 2}
          />
        );
        
      case 'hexagon':
        return (
          <RegularPolygon
            {...shapeProps}
            sides={6}
            radius={Math.min(element.width, element.height) / 2}
          />
        );
        
      case 'star':
        return (
          <Star
            {...shapeProps}
            numPoints={5}
            innerRadius={Math.min(element.width, element.height) / 4}
            outerRadius={Math.min(element.width, element.height) / 2}
          />
        );
        
      case 'arrow':
        return (
          <Line
            {...shapeProps}
            points={[
              0, element.height * 0.3,
              element.width * 0.7, element.height * 0.3,
              element.width * 0.7, 0,
              element.width, element.height * 0.5,
              element.width * 0.7, element.height,
              element.width * 0.7, element.height * 0.7,
              0, element.height * 0.7
            ]}
            closed={true}
          />
        );
        
      default:
        return <Rect {...shapeProps} />;
    }
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
        {renderShape()}
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
          keepRatio={false}
          resizeEnabled={true}
        />
      )}
    </>
  );
};

export default ShapeElement;