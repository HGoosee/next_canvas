import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { CanvasContext } from '../context/CanvasContext';




const ToolbarContainer = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 8px 12px;
  display: flex;
  gap: 10px;
  z-index: 1000;
  border: 1px solid #f0f0f0;
  font-family: 'Virgil', 'Segoe UI', system-ui, -apple-system, sans-serif;
`;

const ToolbarButton = styled.button`
  padding: 8px;
  background-color: ${props => props.active ? '#f0f0f0' : 'transparent'};
  border: ${props => props.active ? '1px solid #d0d0d0' : '1px solid transparent'};
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  color: #1a1a1a;
  min-width: 32px;
  min-height: 32px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f0f0f0;
    border-color: #d0d0d0;
  }
`;

const ColorPicker = styled.input`
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.15s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  &::-webkit-color-swatch {
    border: none;
    border-radius: 50%;

  }
  
  &::-moz-color-swatch {
    border: none;
    border-radius: 3px;
  }
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: white;
  font-size: 14px;
  color: #1a1a1a;
  cursor: pointer;
  min-height: 32px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  font-family: 'Virgil', 'Segoe UI', system-ui, -apple-system, sans-serif;
  
  &:focus {
    outline: none;
    border-color: #a5d8ff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  width: 50px;
  font-size: 14px;
  color: #000000; 
  background-color: #ffffff; 
  min-height: 32px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  font-family: 'Virgil', 'Segoe UI', system-ui, -apple-system, sans-serif;
  
  &:focus {
    outline: none;
    border-color: #a5d8ff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    background-color: #ffffff; 
  }
  
  &::-webkit-inner-spin-button {
    appearance: auto;
    opacity: 1;
    background-color: #f0f0f0;
    border-left: 1px solid #e0e0e0;
    height: 30px;
    width: 10px;
    cursor: pointer;
    margin-right: -2px;
  },
  &::-webkit-outer-spin-button {
    opacity: 1;
    height: 24px;
    background-color: #ffffff; 
    color: #000000; 
    border-left: 1px solid #e0e0e0;
    margin: 0;
  }
    
`;

const ToolbarDivider = styled.div`
  width: 1px;
  align-self: stretch;
  background-color: #e0e0e0;
  margin: 0 4px;
`;

const FloatingToolbar = ({ type }) => {
  const { selectedElements, elements, updateElement } = useContext(CanvasContext);
  const [selectedItems, setSelectedItems] = useState([]);
  
  // 修改 handleUpdate 函数支持多选更新
  const handleUpdate = (updates) => {
    if (selectedItems.length > 0) {
      selectedItems.forEach(item => {
        updateElement(item.id, updates);
      });
    }
  };

  useEffect(() => {
    // 获取所有选中的同类型元素
    const items = elements.filter(el => 
      selectedElements.includes(el.id) && el.type === type
    );
    
    if (items.length > 0) {
      setSelectedItems(items);
    } else {
      setSelectedItems([]);
    }
  }, [selectedElements, elements, type]);
  
  if (selectedItems.length === 0) return null;

  // 使用第一个选中元素的属性作为默认值
  const firstItem = selectedItems[0];

  // 根据类型渲染不同的工具栏内容
  const renderToolbarContent = () => {
    switch (type) {
      case 'text':
        return (
          <>
            <Select
              value={firstItem.fontFamily || 'Arial'}
              onChange={(e) => handleUpdate({ fontFamily: e.target.value })}
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
            </Select>
            <Input
              type="number"
              value={firstItem.fontSize || 16}
              onChange={(e) => handleUpdate({ fontSize: Number(e.target.value) })}
              min={8}
              max={72}
            />
            <ToolbarDivider />
            <ToolbarButton
              active={firstItem.fontStyle?.includes('bold')}
              onClick={() => handleUpdate({ 
                fontStyle: firstItem.fontStyle?.includes('bold') 
                  ? firstItem.fontStyle.replace('bold', '').trim() 
                  : `${firstItem.fontStyle || ''} bold`.trim() 
              })}
            >
              B
            </ToolbarButton>
            
            <ToolbarButton
              active={firstItem.fontStyle?.includes('italic')}
              onClick={() => handleUpdate({ 
                fontStyle: firstItem.fontStyle?.includes('italic') 
                  ? firstItem.fontStyle.replace('italic', '').trim() 
                  : `${firstItem.fontStyle || ''} italic`.trim() 
              })}
            >
              I
            </ToolbarButton>
            
            <ToolbarButton
              active={firstItem.textDecoration?.includes('underline')}
              onClick={() => handleUpdate({ 
                textDecoration: firstItem.textDecoration?.includes('underline') 
                  ? firstItem.textDecoration.replace('underline', '').trim() 
                  : `${firstItem.textDecoration || ''} underline`.trim() 
              })}
            >
              U
            </ToolbarButton>
            
            <ToolbarButton
              active={firstItem.textDecoration?.includes('line-through')}
              onClick={() => handleUpdate({ 
                textDecoration: firstItem.textDecoration?.includes('line-through') 
                  ? firstItem.textDecoration.replace('line-through', '').trim() 
                  : `${firstItem.textDecoration || ''} line-through`.trim() 
              })}
            >
              S
            </ToolbarButton>
            
            <ToolbarDivider />
            
            <ColorPicker
              type="color"
              value={firstItem.fill || '#000000'}
              onChange={(e) => handleUpdate({ fill: e.target.value })}
            />
          </>
        );

        case 'shape':
          return (
            <>
              <ColorPicker
                type="color"
                value={firstItem.fill || '#ffffff'}
                onChange={(e) => handleUpdate({ fill: e.target.value })}
              />
              <ColorPicker
                type="color"
                value={firstItem.stroke || '#000000'}
                onChange={(e) => handleUpdate({ stroke: e.target.value })}
              />
              <Input
                type="number"
                value={firstItem.strokeWidth || 1}
                onChange={(e) => handleUpdate({ strokeWidth: Number(e.target.value) })}
                min={1}
                max={20}
              />
            </>
          );

          case 'image':
            return (
              <>
                <Input
                  type="number"
                  value={firstItem.width || 100}
                  onChange={(e) => handleUpdate({ width: Number(e.target.value) })}
                  min={20}
                  max={1000}
                />
                <Input
                  type="number"
                  value={firstItem.height || 100}
                  onChange={(e) => handleUpdate({ height: Number(e.target.value) })}
                  min={20}
                  max={1000}
                />
              </>
            );

      default:
        return null;
    }
  };

  return (
    <ToolbarContainer>
      {renderToolbarContent()}
    </ToolbarContainer>
  );
};

export default FloatingToolbar;