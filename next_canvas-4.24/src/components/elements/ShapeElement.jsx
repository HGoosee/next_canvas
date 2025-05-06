import React, { useContext, useRef, useEffect } from 'react';
import { Rect, Circle, RegularPolygon, Star, Line, Group, Transformer, Ellipse } from 'react-konva';
import { CanvasContext } from '../../context/CanvasContext.jsx';
import TRANSFORMER_CONFIG from '../../config/config.jsx'

const ShapeElement = ({ element, isSelected, isMultiSelect , currentTool  }) => {
  const { selectElement, updateElement, selectedElements} = useContext(CanvasContext);
  const shapeRef = useRef(null);
  const groupRef = useRef(null);
  const transformerRef = useRef(null);
  const initialPositionRef = useRef({ x: element.x, y: element.y });


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
    // 阻止事件冒泡
    e.cancelBubble = true;

    if (!isSelected) {
      selectElement(element.id, e.evt.shiftKey);
    }
  };

  const handleDragStart = (e) => {
    // 阻止事件冒泡
    e.cancelBubble = true;
    if (!isSelected) {
      selectElement(element.id, e.evt.shiftKey);
    }
  };


  const handleDragEnd = (e) => {
    // 阻止事件冒泡
    e.cancelBubble = true;

    // 计算位置变化量
    const deltaX = e.target.x() - initialPositionRef.current.x;
    const deltaY = e.target.y() - initialPositionRef.current.y;

    // 如果是多选状态，只让第一个元素触发更新
    if (selectedElements.length > 1) {
      // 确保只有当前元素是选中元素中的第一个时才触发更新
      if (element.id === selectedElements[0]) {
        updateElement(selectedElements, {
          deltaX,
          deltaY
        });
      }
      // 无论是否是第一个元素，都更新其初始位置
      initialPositionRef.current = {
        x: e.target.x(),
        y: e.target.y()
      };
    } else {
      // 单选状态的处理保持不变
      updateElement(element.id, {
        x: e.target.x(),
        y: e.target.y()
      });
    }
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

  const handleMouseEnter = (e) => {
    const stage = e.target.getStage();
    if (currentTool === 'drag') {
      if (e.evt.buttons === 1) {  // 如果鼠标按下
        stage.container().style.cursor = 'grabbing';
      } else {
        stage.container().style.cursor = 'grab';
      }
    } else if (isSelected && currentTool === 'select') {
      stage.container().style.cursor = 'move';
    }
  };
  
  const handleMouseLeave = (e) => {
    const stage = e.target.getStage();
    if (currentTool === 'drag') {
      if (e.evt.buttons === 1) {  // 如果鼠标按下
        stage.container().style.cursor = 'grabbing';
      } else {
        stage.container().style.cursor = 'grab';
      }
    } else {
      stage.container().style.cursor = 'default';
    }
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
      rotation: rotation,
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
      perfectDrawEnabled: true,
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
          // 修改椭圆是胶囊型的问题->使用Ellipse
          <Ellipse
            {...shapeProps}
            radiusX={element.width / 2}  // 修改这里
            radiusY={element.height / 2} 
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
        onTransformEnd={handleTransformEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {renderShape()}
      </Group>
      {isSelected && currentTool === 'select' && (
        <Transformer
          ref={transformerRef}
          {...TRANSFORMER_CONFIG}
          boundBoxFunc={(oldBox, newBox) => {
            // 限制最小尺寸
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default ShapeElement;