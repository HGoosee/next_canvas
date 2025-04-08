import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { CanvasContext } from '../context/CanvasContext';

const ToolbarContainer = styled.div`
  width: 60px;
  height: 100%;
  background-color: #2c2c2c;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
  overflow-y: auto;
  position: fixed; /* 固定位置 */
  left: 0; /* 固定在左侧 */
  top: 0; /* 从顶部开始 */
  bottom: 0; /* 延伸到底部 */
  z-index: 1000; /* 确保在其他元素上方 */
`;

const ToolButton = styled.button`
  width: 40px;
  height: 40px;
  margin: 5px 0;
  border-radius: 4px;
  border: none;
  background-color: ${props => props.active ? '#4d4d4d' : 'transparent'};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #4d4d4d;
  }
`;

const Divider = styled.div`
  width: 40px;
  height: 1px;
  background-color: #4d4d4d;
  margin: 10px 0;
`;

const shapeTypes = [
  { id: 'rectangle', name: '矩形', icon: '□' },
  { id: 'roundedRectangle', name: '圆角矩形', icon: '▢' },
  { id: 'circle', name: '圆形', icon: '○' },
  { id: 'ellipse', name: '椭圆', icon: '⬭' },
  { id: 'triangle', name: '三角形', icon: '△' },
  { id: 'diamond', name: '菱形', icon: '◇' },
  { id: 'pentagon', name: '五边形', icon: '⬠' },
  { id: 'hexagon', name: '六边形', icon: '⬡' },
  { id: 'star', name: '星形', icon: '★' },
  { id: 'arrow', name: '箭头', icon: '→' }
];

const Toolbar = () => {
  const { currentTool, setCurrentTool, addElement } = useContext(CanvasContext);
  const [currentShapeType, setCurrentShapeType] = useState('rectangle');
  
  const handleSelectTool = (tool) => {
    setCurrentTool(tool);
  };
  
  const handleAddText = (e) => {
    // 阻止事件冒泡，防止工具栏消失
    e.stopPropagation();
    
    // 为 Konva 文本元素创建适当的属性
    addElement({
      type: 'text',
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      text: '点击编辑文本',
      fontFamily: 'Arial',
      fontSize: 16,
      fill: '#000000',
      draggable: true,
      fontStyle: '',
      textDecoration: '',
      align: 'left',
      listening: true,
      perfectDrawEnabled: true,
      transformsEnabled: 'all'
    });
  };
  
  const handleAddShape = (e, shapeType) => {
    // 阻止事件冒泡，防止工具栏消失
    e.stopPropagation();
    
    // 更新当前选中的形状类型
    setCurrentShapeType(shapeType);
    
    // 为 Konva 形状元素创建适当的属性
    addElement({
      type: 'shape',
      shapeType,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 3,
      draggable: true,
      cornerRadius: shapeType === 'roundedRectangle' ? 10 : 0,
      listening: true,
      perfectDrawEnabled: true,
      transformsEnabled: 'all'
    });
  };
  
  const handleAddImage = (e) => {
    // 阻止事件冒泡，防止工具栏消失
    e.stopPropagation();
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          // 创建临时图片对象获取尺寸
          const img = new Image();
          img.onload = () => {
            // 设置最大尺寸
            const maxSize = 500;
            let width = img.width;
            let height = img.height;
            
            // 等比例缩放
            if (width > maxSize || height > maxSize) {
              if (width > height) {
                height = (height / width) * maxSize;
                width = maxSize;
              } else {
                width = (width / height) * maxSize;
                height = maxSize;
              }
            }
            
            // 为 Konva 图片元素创建适当的属性
            addElement({
              type: 'image',
              x: 100,
              y: 100,
              width,
              height,
              src: event.target.result,
              draggable: true,
              listening: true,
              perfectDrawEnabled: true,
              transformsEnabled: 'all'
            });
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  return (
    <ToolbarContainer>
      <ToolButton
        active={currentTool === 'select'}
        onClick={(e) => {
          e.stopPropagation();
          handleSelectTool('select');
        }}
        title="选择工具"
      >
        ↖
      </ToolButton>

      <ToolButton
        title="拖拽画布"
        active={currentTool === 'hand'}
        onClick={() => handleSelectTool('hand')}
      >
        ✋
      </ToolButton>
      
      <ToolButton
        active={currentTool === 'text'}
        onClick={(e) => {
          e.stopPropagation();
          handleSelectTool('text');
          handleAddText(e);
        }}
        title="文本工具"
      >
        T
      </ToolButton>
      
      <Divider />
      
      {shapeTypes.map(shape => (
        <ToolButton
          key={shape.id}
          active={currentTool === 'shape' && currentShapeType === shape.id}
          onClick={(e) => {
            e.stopPropagation();
            handleSelectTool('shape');
            handleAddShape(e, shape.id);
          }}
          title={shape.name}
        >
          {shape.icon}
        </ToolButton>
      ))}
      
      <Divider />
      
      <ToolButton
        active={currentTool === 'image'}
        onClick={(e) => {
          e.stopPropagation();
          handleSelectTool('image');
          handleAddImage(e);
        }}
        title="图片工具"
      >
        🖼️
      </ToolButton>
    </ToolbarContainer>
  );
};

export default Toolbar;