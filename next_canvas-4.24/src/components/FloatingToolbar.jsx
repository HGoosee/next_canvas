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
  width: 63px;
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

const ToolbarDivider1 = styled.div`
  width: 1px;
  align-self: stretch;
  background-color:rgb(123, 122, 122);
  margin: 0 4px;
`;

const FloatingToolbar = ({ type }) => {
  const { selectedElements, elements, updateElement } = useContext(CanvasContext);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  //存贮 设置字体、边框、图片边界值 的临时值
  const [tempFontSize, setTempFontSize] = useState(16);
  const [tempStrokeWidth, setTempStrokeWidth] = useState(1);
  const [tempWidth, setTempWidth] = useState(100);
  const [tempHeight, setTempHeight] = useState(100);

  // 获取第一个选中项
  const firstItem = selectedItems.length > 0 ? selectedItems[0] : null;

  

  //更新选中元素
  // useEffect(() => {
  //   // 获取所有选中的同类型元素
  //   const items = elements.filter(el => 
  //     selectedElements.includes(el.id) && el.type === type
  //   );
    
  //   if (items.length > 0) {
  //     setSelectedItems(items);
  //   } else {
  //     setSelectedItems([]);
  //   }
  // }, [selectedElements, elements, type]);
  useEffect(() => {
      const items = elements.filter(el => selectedElements.includes(el.id));
      const types = [...new Set(items.map(item => item.type))];
      setSelectedItems(items);
      setSelectedTypes(types);
    }, [selectedElements, elements]);//不用获取type值了

  // 更新本地状态当选中元素变化
  // useEffect(() => {
  //   if (firstItem) {
  //     setTempFontSize(firstItem.fontSize || 16);
  //     setTempStrokeWidth(firstItem.strokeWidth || 1);
  //     setTempWidth(firstItem.width || 100);
  //     setTempHeight(firstItem.height || 100);
  //   }
  // }, [firstItem]); // 只依赖 firstItem
  useEffect(() => {
    const firstTextItem = selectedItems.find(item => item.type === 'text');//第一个选中的文本元素
    const firstShapeItem = selectedItems.find(item => item.type === 'shape');//第一个选中的形状元素
    const firstImageItem = selectedItems.find(item => item.type === 'image');//第一个选中的图片元素

    if (firstTextItem) {//如果有文本元素，更新字体大小
      setTempFontSize(firstTextItem.fontSize || 16);
    }
    if (firstShapeItem) {//如果有形状元素，更新边框宽度
      setTempStrokeWidth(firstShapeItem.strokeWidth || 1);
    }
    if (firstImageItem) {
      setTempWidth(firstImageItem.width || 100);
      setTempHeight(firstImageItem.height || 100);
    }
  }, [selectedItems]);
  
  // 修改 handleUpdate 函数支持多选更新
  const handleUpdate = (updates, batch = false) => {
    if (selectedItems.length > 0) {
    // 获取所有选中元素的ID
    const selectedIds = selectedItems.map(item => item.id);
    // 批量更新所有选中元素
    updateElement(selectedIds, updates);
    }
  };
  
  if (selectedItems.length === 0) return null;

  // 根据类型渲染不同的工具栏内容
  // const renderToolbarContent = () => {
  //   switch (type) {
  //     case 'text':
  //       return (
  //         <>
  //           <Select
  //             value={firstItem.fontFamily || 'Arial'}
  //             onChange={(e) => handleUpdate({ fontFamily: e.target.value })}
  //           >
  //             <option value="Arial">Arial</option>
  //             <option value="Times New Roman">Times New Roman</option>
  //             <option value="Courier New">Courier New</option>
  //             <option value="宋体">宋体</option>
  //             <option value="微软雅黑">微软雅黑</option>
  //             <option value="黑体">黑体</option>
  //             <option value="楷体">楷体</option>
  //             <option value="仿宋">仿宋</option>
  //             <option value="等线">等线</option>
  //           </Select>
  //           <Input
  //             type="number"
  //             value={tempFontSize}
  //             onChange={(e) => setTempFontSize(e.target.value)}
  //             onBlur={() => {
  //               const value = Math.min(72, Math.max(8, Number(tempFontSize) || 16));
  //               setTempFontSize(value);
  //               handleUpdate({ fontSize: value });
  //             }}
  //             onKeyDown={(e) => {
  //               if (e.key === 'Enter') {
  //                 const value = Math.min(72, Math.max(8, Number(tempFontSize) || 16));
  //                 setTempFontSize(value);
  //                 handleUpdate({ fontSize: value });
  //                 e.target.blur();
  //               }
  //             }}
  //             min={8}
  //             max={72}
  //           />
  //           <ToolbarDivider />
  //           <ToolbarButton
  //             active={firstItem.fontStyle?.includes('bold')}
  //             onClick={() => handleUpdate({ 
  //               fontStyle: firstItem.fontStyle?.includes('bold') 
  //                 ? firstItem.fontStyle.replace('bold', '').trim() 
  //                 : `${firstItem.fontStyle || ''} bold`.trim() 
  //             })}
  //           >
  //             B
  //           </ToolbarButton>
            
  //           <ToolbarButton
  //             active={firstItem.fontStyle?.includes('italic')}
  //             onClick={() => handleUpdate({ 
  //               fontStyle: firstItem.fontStyle?.includes('italic') 
  //                 ? firstItem.fontStyle.replace('italic', '').trim() 
  //                 : `${firstItem.fontStyle || ''} italic`.trim() 
  //             })}
  //           >
  //             I
  //           </ToolbarButton>
            
  //           <ToolbarButton
  //             active={firstItem.textDecoration?.includes('underline')}
  //             onClick={() => handleUpdate({ 
  //               textDecoration: firstItem.textDecoration?.includes('underline') 
  //                 ? firstItem.textDecoration.replace('underline', '').trim() 
  //                 : `${firstItem.textDecoration || ''} underline`.trim() 
  //             })}
  //           >
  //             U
  //           </ToolbarButton>
            
  //           <ToolbarButton
  //             active={firstItem.textDecoration?.includes('line-through')}
  //             onClick={() => handleUpdate({ 
  //               textDecoration: firstItem.textDecoration?.includes('line-through') 
  //                 ? firstItem.textDecoration.replace('line-through', '').trim() 
  //                 : `${firstItem.textDecoration || ''} line-through`.trim() 
  //             })}
  //           >
  //             S
  //           </ToolbarButton>
            
  //           <ToolbarDivider />
            
  //           <ColorPicker
  //             type="color"
  //             value={firstItem.fill || '#000000'}
  //             onChange={(e) => handleUpdate({ fill: e.target.value })}
              
  //           />
  //         </>
  //       );

  //       case 'shape':
  //         return (
  //           <>
  //             <ColorPicker
  //               type="color"
  //               value={firstItem.fill || '#ffffff'}
  //               onChange={(e) => handleUpdate({ fill: e.target.value })}
  //             />
  //             <ColorPicker
  //               type="color"
  //               value={firstItem.stroke || '#000000'}
  //               onChange={(e) => handleUpdate({ stroke: e.target.value })}
  //             />
  //             <Input
  //               type="number"
  //               value={tempStrokeWidth}
  //               onChange={(e) => setTempStrokeWidth(e.target.value)}
  //               onBlur={() => {
  //                 const value = Math.min(20, Math.max(1, Number(tempStrokeWidth) || 1));
  //                 setTempStrokeWidth(value);
  //                 handleUpdate({ strokeWidth: value });
  //               }}
  //               onKeyDown={(e) => {
  //                 if (e.key === 'Enter') {
  //                   const value = Math.min(20, Math.max(1, Number(tempStrokeWidth) || 1));
  //                   setTempStrokeWidth(value);
  //                   handleUpdate({ strokeWidth: value });
  //                   e.target.blur();
  //                 }
  //               }}
  //               min={1}
  //               max={20}
  //             />
  //           </>
  //         );

  //         case 'image':
  //           return (
  //             <>
  //               <Input
  //                 type="number"
  //                 value={tempWidth}
  //                 onChange={(e) => setTempWidth(e.target.value)}
  //                 onBlur={() => {
  //                   const value = Math.min(1000, Math.max(20, Number(tempWidth) || 100));
  //                   setTempWidth(value);
  //                   handleUpdate({ width: value });
  //                 }}
  //                 onKeyDown={(e) => {
  //                   if (e.key === 'Enter') {
  //                     const value = Math.min(1000, Math.max(20, Number(tempWidth) || 100));
  //                     setTempWidth(value);
  //                     handleUpdate({ width: value });
  //                     e.target.blur();
  //                   }
  //                 }}
  //                 min={20}
  //                 max={1000}
  //               />
  //               <Input
  //                 type="number"
  //                 value={tempHeight}
  //                 onChange={(e) => setTempHeight(e.target.value)}
  //                 onBlur={() => {
  //                   const value = Math.min(1000, Math.max(20, Number(tempHeight) || 100));
  //                   setTempHeight(value);
  //                   handleUpdate({ height: value });
  //                 }}
  //                 onKeyDown={(e) => {
  //                   if (e.key === 'Enter') {
  //                     const value = Math.min(1000, Math.max(20, Number(tempHeight) || 100));
  //                     setTempHeight(value);
  //                     handleUpdate({ height: value });
  //                     e.target.blur();
  //                   }
  //                 }}
  //                 min={20}
  //                 max={1000}
  //               />
  //             </>
  //           );

  //     default:
  //       return null;
  //   }
  // };
  const renderToolbarContent = () => {
    const textTools = (
      <>
        <Select
          value={(selectedItems.find(item => item.type === 'text')?.fontFamily || 'Arial')}
          onChange={(e) => handleUpdate({ fontFamily: e.target.value })}
          title='字体'
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="宋体">宋体</option>
          <option value="微软雅黑">微软雅黑</option>
          <option value="黑体">黑体</option>
          <option value="楷体">楷体</option>
          <option value="仿宋">仿宋</option>
          <option value="等线">等线</option>
        </Select>
        <Input
          type="number"
          value={tempFontSize}
          title='字号'
          onChange={(e) => setTempFontSize(e.target.value)}
          onBlur={() => {
            const value = Math.min(72, Math.max(8, Number(tempFontSize) || 16));
            setTempFontSize(value);
            handleUpdate({ fontSize: value });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const value = Math.min(72, Math.max(8, Number(tempFontSize) || 16));
              setTempFontSize(value);
              handleUpdate({ fontSize: value });
              e.target.blur();
            }
          }}
          min={8}
          max={72}
        />
        <ToolbarDivider />
        <ToolbarButton
          active={(selectedItems.find(item => item.type === 'text')?.fontStyle || '').includes('bold')}
          onClick={() => handleUpdate({
            fontStyle: (selectedItems.find(item => item.type === 'text')?.fontStyle || '').includes('bold')
              ? (selectedItems.find(item => item.type === 'text')?.fontStyle || '').replace('bold', '').trim()
              : `${selectedItems.find(item => item.type === 'text')?.fontStyle || ''} bold`.trim()
          })}
          title='加粗'
        >
          B
        </ToolbarButton>
        <ToolbarButton
          active={(selectedItems.find(item => item.type === 'text')?.fontStyle || '').includes('italic')}
          onClick={() => handleUpdate({
            fontStyle: (selectedItems.find(item => item.type === 'text')?.fontStyle || '').includes('italic')
              ? (selectedItems.find(item => item.type === 'text')?.fontStyle || '').replace('italic', '').trim()
              : `${selectedItems.find(item => item.type === 'text')?.fontStyle || ''} italic`.trim()
          })}
          title='斜体'
        >
          I
        </ToolbarButton>
        <ToolbarButton
          active={(selectedItems.find(item => item.type === 'text')?.textDecoration || '').includes('underline')}
          onClick={() => handleUpdate({
            textDecoration: (selectedItems.find(item => item.type === 'text')?.textDecoration || '').includes('underline')
              ? (selectedItems.find(item => item.type === 'text')?.textDecoration || '').replace('underline', '').trim()
              : `${selectedItems.find(item => item.type === 'text')?.textDecoration || ''} underline`.trim()
          })}
          title='下划线'
        >
          U
        </ToolbarButton>
        <ToolbarButton
          active={(selectedItems.find(item => item.type === 'text')?.textDecoration || '').includes('line-through')}
          onClick={() => handleUpdate({
            textDecoration: (selectedItems.find(item => item.type === 'text')?.textDecoration || '').includes('line-through')
              ? (selectedItems.find(item => item.type === 'text')?.textDecoration || '').replace('line-through', '').trim()
              : `${selectedItems.find(item => item.type === 'text')?.textDecoration || ''} line-through`.trim()
          })}
          title='删除线'
        >
          S
        </ToolbarButton>
        <ToolbarDivider />
        <ColorPicker
          type="color"
          value={selectedItems.find(item => item.type === 'text')?.fill || '#000000'}
          onChange={(e) => handleUpdate({ fill: e.target.value })}
          title='字体颜色'
        />
      </>
    );

    const shapeTools = (
      <>
        <ColorPicker
          type="color"
          value={selectedItems.find(item => item.type === 'shape')?.fill || '#ffffff'}
          onChange={(e) => handleUpdate({ fill: e.target.value })}
          title='填充颜色'
        />
        <ColorPicker
          type="color"
          value={selectedItems.find(item => item.type === 'shape')?.stroke || '#000000'}
          onChange={(e) => handleUpdate({ stroke: e.target.value })}
          title='边框颜色'
        />
        <Input
          type="number"
          title='边框粗细'
          value={tempStrokeWidth}
          onChange={(e) => setTempStrokeWidth(e.target.value)}
          onBlur={() => {
            const value = Math.min(20, Math.max(1, Number(tempStrokeWidth) || 1));
            setTempStrokeWidth(value);
            handleUpdate({ strokeWidth: value });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const value = Math.min(20, Math.max(1, Number(tempStrokeWidth) || 1));
              setTempStrokeWidth(value);
              handleUpdate({ strokeWidth: value });
              e.target.blur();
            }
          }}
          min={1}
          max={20}
        />
      </>
    );

    const imageTools = (
      <>
        <Input
          type="number"
          title='图片宽度(20-1000px)'
          value={tempWidth}
          onChange={(e) => setTempWidth(e.target.value)}
          onBlur={() => {
            const value = Math.min(1000, Math.max(20, Number(tempWidth) || 100));
            setTempWidth(value);
            handleUpdate({ width: value });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const value = Math.min(1000, Math.max(20, Number(tempWidth) || 100));
              setTempWidth(value);
              handleUpdate({ width: value });
              e.target.blur();
            }
          }}
          min={20}
          max={1000}
        />
        <Input
          type="number"
          title='图片高度(20-1000px)'
          value={tempHeight}
          onChange={(e) => setTempHeight(e.target.value)}
          onBlur={() => {
            const value = Math.min(1000, Math.max(20, Number(tempHeight) || 100));
            setTempHeight(value);
            handleUpdate({ height: value });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const value = Math.min(1000, Math.max(20, Number(tempHeight) || 100));
              setTempHeight(value);
              handleUpdate({ height: value });
              e.target.blur();
            }
          }}
          min={20}
          max={1000}
        />
      </>
    );

    return (
      <>
        {selectedTypes.includes('text') && textTools}
        {/* 当出现多个选中元素类型就出现分隔符1 */}
        {selectedTypes.includes('shape') && selectedTypes.includes('text') && <ToolbarDivider1 />}
        {selectedTypes.includes('shape') && shapeTools}
        {selectedTypes.includes('image') && selectedTypes.includes('shape') && <ToolbarDivider1 />}
        {selectedTypes.includes('image') && imageTools}
      </>
    );
  };
  return (
    <ToolbarContainer>
      {renderToolbarContent()}
    </ToolbarContainer>
  );
};

export default FloatingToolbar;