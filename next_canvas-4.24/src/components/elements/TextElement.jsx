import React, { useContext, useState, useRef, useEffect } from 'react';
import { Text, Group, Transformer } from 'react-konva';
import { CanvasContext } from '../../context/CanvasContext';
import TRANSFORMER_CONFIG from '../../config/config.jsx'

const TextElement = ({ element, isSelected, isMultiSelect, currentTool  }) => {
  const { selectElement, updateElement } = useContext(CanvasContext);
  const textRef = useRef(null);
  const transformerRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (isSelected && transformerRef.current && textRef.current) {
      // 附加变换器到文本节点
      transformerRef.current.nodes([textRef.current]);
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
    updateElement(element.id, {
      x: e.target.x(),
      y: e.target.y()
    });
  };
  
  const handleTransformEnd = (e) => {
    const node = textRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation ? node.rotation() : 0;
    
    // 计算新的宽高和字体大小，移除最小值限制
    const width = element.width * scaleX;
    const height = element.height * scaleY;
    // const fontSize = Math.max(1, element.fontSize * scaleY); // 字体大小保留最小值1px
    
    // 重置缩放，但保留旋转
    node.scaleX(1);
    node.scaleY(1);
    
    // 更新元素属性
    updateElement(element.id, {
      x: node.x(),
      y: node.y(),
      width: width,
      height: height,
      // fontSize: fontSize,
      rotation: rotation
    });
  };
  
  const handleDblClick = (e) => {
    if (!isEditing) {
      setIsEditing(true);
      const textNode = textRef.current;
      const stage = textNode.getStage();
      const container = stage.container();
      
      // 获取文本节点的位置和样式
      const textPosition = textNode.absolutePosition();
      const rotation = textNode.rotation();
      const scaleX = textNode.scaleX();
      const scaleY = textNode.scaleY();

      // 创建文本编辑框
      const textarea = document.createElement('textarea');
      container.appendChild(textarea);
      textarea.value = element.text || '';
      
      // 设置文本编辑框样式
      textarea.style.position = 'absolute';
      textarea.style.top = `${textPosition.y}px`;
      textarea.style.left = `${textPosition.x}px`;
      textarea.style.width = `${textNode.width() * scaleX}px`;
      textarea.style.height = `${textNode.height() * scaleY}px`;
      textarea.style.fontSize = `${element.fontSize * scaleY}px`;
      textarea.style.transform = `rotate(${rotation}deg)`;
      textarea.style.transformOrigin = 'left top';
      textarea.style.fontFamily = element.fontFamily;
      textarea.style.lineHeight = element.lineHeight || '1';
      textarea.style.padding = '0px';
      textarea.style.margin = '0px';
      textarea.style.overflow = 'hidden';
      textarea.style.background = 'none';
      textarea.style.border = 'none';
      textarea.style.outline = 'none';
      textarea.style.resize = 'none';
      textarea.style.transformOrigin = 'left top';
      textarea.style.textAlign = element.align || 'left';
      textarea.style.color = element.fill;
      textarea.style.fontStyle = element.fontStyle || '';
      textarea.style.textDecoration = element.textDecoration || '';

      textarea.focus();
      textarea.select();//双击保证全选内部文字

      const handleBlur = () => {
        const newText = textarea.value;
        container.removeChild(textarea);
        setIsEditing(false);
        
        // 更新文本内容，保持原有的宽高
        updateElement(element.id, {
          text: newText,
          // 保持原有的宽高，不再重新计算
          width: element.width,
          height: element.height
        });
        
        textarea.removeEventListener('blur', handleBlur);
        stage.batchDraw();
      };

      textarea.addEventListener('blur', handleBlur);
      
      textarea.addEventListener('keydown', (e) => {
        // 处理回车键
        if (e.key === 'Enter' && !e.shiftKey) {
          textarea.blur();
        }
        // 处理ESC键
        if (e.key === 'Escape') {
          textarea.blur();
        }
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

  return (
    <>
      <Text
        id={`${element.id}`}  // 添加 id 属性
        ref={textRef}
        x={element.x}
        y={element.y}
        text={element.text}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        fill={element.fill || "#000000"}
        width={element.width}  // 直接使用元素的宽度
        height={element.height}  // 直接使用元素的高度
        draggable={!isEditing}
        onDragEnd={handleDragEnd}
        onClick={handleSelect}
        onTap={handleSelect}
        onDblClick={handleDblClick}
        onDblTap={handleDblClick}
        onDragStart={handleDragStart}
        fontStyle={element.fontStyle || ""}
        textDecoration={element.textDecoration || ""}
        align={element.align || "left"}
        scaleX={element.scaleX || 1}
        scaleY={element.scaleY || 1}
        rotation={element.rotation || 0}
        visible={!isEditing}  // 编辑时完全隐藏文本
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      />
      {isSelected && currentTool === 'select' && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // 移除最小尺寸限制，允许自由缩放
            return newBox;
          }}
          {...TRANSFORMER_CONFIG}
          onTransformEnd={handleTransformEnd}
          // rotateEnabled={true}
          // rotationSnaps={[0, 90, 180, 270]}
          // enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
        />
      )}
    </>
  );
};

export default TextElement;