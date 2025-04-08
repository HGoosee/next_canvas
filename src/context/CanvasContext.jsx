import React, { createContext, useState, useRef } from 'react';

export const CanvasContext = createContext();

export const CanvasProvider = ({ children }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedElements, setSelectedElements] = useState([]);
  const [elements, setElements] = useState([]);
  const [activeToolbar, setActiveToolbar] = useState(null);
  const [currentTool, setCurrentTool] = useState('select');
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);



  // 添加历史记录
  const addToHistory = (newElements) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setCurrentIndex(currentIndex + 1);
  };



  const addElement = (elementData) => {
    // 计算元素在画布上的实际位置
    const margin = 100; // 距离边界的距离
    const adjustedX = (-position.x + margin) / scale;
    const adjustedY = (-position.y + margin) / scale;

    const newElement = {
      id: Date.now(),
      ...elementData,
      // 更新元素的初始位置
      x: adjustedX,
      y: adjustedY
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElements([newElement.id]);
  };

  const updateElement = (id, properties) => {
    let newElements;
    if (Array.isArray(id)) {
      newElements = elements.map(el => 
        id.includes(el.id) ? { ...el, ...properties } : el
      );
    } else {
      newElements = elements.map(el => 
        el.id === id ? { ...el, ...properties } : el
      );
    }
    setElements(newElements);
    addToHistory(newElements); // 添加到历史记录
  };

  // 修改 deleteSelectedElements 函数，添加历史记录
  const deleteSelectedElements = () => {
    if (selectedElements.length > 0) {
      const newElements = elements.filter(el => !selectedElements.includes(el.id));
      setElements(newElements);
      setSelectedElements([]);
      setActiveToolbar(null);
      addToHistory(newElements); // 添加到历史记录
    }
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setElements(history[currentIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setElements(history[currentIndex + 1]);
    }
  };

  const selectElement = (id, isMultiSelect = false) => {
    if (isMultiSelect) {
      setSelectedElements(prev => 
        prev.includes(id) 
          ? prev.filter(elId => elId !== id) 
          : [...prev, id]
      );
    } else {
      setSelectedElements([id]);
    }


    
    // 设置活动工具栏类型
    const element = elements.find(el => el.id === id);
    if (element) {
      setActiveToolbar(element.type);
    }
  };

  const clearSelection = () => {
    setSelectedElements([]);
    setActiveToolbar(null);
  };

  return (
    <CanvasContext.Provider
      value={{
        scale,
        setScale,
        position,
        setPosition,
        elements,
        setElements,
        addElement,
        updateElement,
        selectedElements,
        setSelectedElements,
        selectElement,
        clearSelection,
        deleteSelectedElements,
        activeToolbar,
        setActiveToolbar,
        currentTool,
        setCurrentTool,
        history,
        currentIndex,
        handleUndo,
        handleRedo,
        addToHistory
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};