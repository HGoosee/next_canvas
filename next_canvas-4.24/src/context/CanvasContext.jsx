import React, { createContext, useState, useRef, useEffect } from 'react';
import { initPersistence, debouncedSaveToIndexedDB } from '../services/PersistenceService';

export const CanvasContext = createContext();

export const CanvasProvider = ({ children }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedElements, setSelectedElements] = useState([]);
  const [elements, setElements] = useState([]);
  const [activeToolbar, setActiveToolbar] = useState(null);
  const [currentTool, setCurrentTool] = useState('select');
  const [history, setHistory] = useState([[]]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFullHistory, setIsLoadingFullHistory] = useState(false);
  const persistenceRef = useRef(null);

// 修改初始化部分
useEffect(() => {
  console.log('初始化 Canvas 持久化...');
  
  persistenceRef.current = initPersistence('current', (loadedData) => {
    if (loadedData.elements) {
      console.log('从 IndexedDB 加载数据:', loadedData);
      
      // 确保元素数组有效
      const validElements = Array.isArray(loadedData.elements) ? loadedData.elements : [];
      setElements(validElements);
      
      // 确保历史记录有效
      if (Array.isArray(loadedData.history) && loadedData.history.length > 0) {
        // 验证历史记录中的每个状态都是有效的数组
        const validHistory = loadedData.history.map(state => 
          Array.isArray(state) ? state : []
        );
        
        // 如果是完整历史记录，更新加载状态
        if (!loadedData.isPartialHistory) {
          setIsLoadingFullHistory(false);
        } else {
          setIsLoadingFullHistory(true);
        }
        
        setHistory(validHistory);
        
        // 确保 currentIndex 在有效范围内
        const validIndex = Math.min(
          Math.max(0, loadedData.currentIndex || 0),
          validHistory.length - 1
        );
        setCurrentIndex(validIndex);
      } else {
        // 如果没有有效的历史记录，使用当前元素创建新的历史记录
        setHistory([[], validElements]);
        setCurrentIndex(1);
      }
    }
    
    setIsLoading(false);
  });
  
  return () => {
    if (persistenceRef.current) {
      persistenceRef.current.destroy();
    }
  };
}, []);

  // 添加历史记录
  const addToHistory = (newElements) => {
  // 验证新元素数组
  if (!Array.isArray(newElements)) {
    console.error('Invalid elements array:', newElements);
    return;
  }

  // 创建历史记录的新副本
  const newHistory = history.slice(0, currentIndex + 1);
  
  // 比较新状态与当前状态
  const currentState = newHistory[currentIndex] || [];
  
  // 修改比较方式，确保深度比较
  const hasChanges = JSON.stringify(sortElementsById(currentState)) !== 
                    JSON.stringify(sortElementsById(newElements));
  
  if (hasChanges) {
    // 确保深拷贝并按 ID 排序
    const deepCopiedElements = sortElementsById(
      newElements.map(element => ({...element}))
    );
    
    newHistory.push(deepCopiedElements);
    setHistory(newHistory);
    setCurrentIndex(currentIndex + 1);
    
    
    debouncedSaveToIndexedDB({
      elements: deepCopiedElements,
      history: newHistory,
      currentIndex: currentIndex + 1
    });
  }
  };

  // 添加辅助函数：按 ID 排序元素
  const sortElementsById = (elements) => {
    if (!Array.isArray(elements)) return [];
    return [...elements].sort((a, b) => a.id.localeCompare(b.id));
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const previousState = history[newIndex];
      // console.log("撤销操作 - 前一个状态:", previousState);
      
      if (Array.isArray(previousState)) {
        // 确保深拷贝并按 ID 排序
        const restoredElements = sortElementsById(
          previousState.map(element => ({...element}))
        );
        
        setElements(restoredElements);
        setCurrentIndex(newIndex);
        setSelectedElements([]);
        setActiveToolbar(null);
        
        debouncedSaveToIndexedDB({
          elements: restoredElements,
          history: history,
          currentIndex: newIndex
        });
      }
    }
  };

  const addElement = (elementData) => {
    // 计算元素在画布上的实际位置
    const margin = 100; // 距离边界的距离
    const adjustedX = (-position.x + margin) / scale;
    const adjustedY = (-position.y + margin) / scale;

    const newElement = {
      id: Date.now().toString(), // 确保ID是字符串
      ...elementData,
      // 更新元素的初始位置
      x: adjustedX,
      y: adjustedY
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    // 自动切换回选择工具
    setCurrentTool('select');
    setSelectedElements([newElement.id]);
    addToHistory(newElements);
  };

  const updateElement = (id, properties) => {
    setElements(prevElements => {
      let newElements;
      
      if (Array.isArray(id)) {
        // 批量更新元素
        newElements = prevElements.map(el => {
          if (id.includes(el.id)) {
            // 处理位置变化
            if ('deltaX' in properties || 'deltaY' in properties) {
              return {
                ...el,
                x: el.x + (properties.deltaX || 0),
                y: el.y + (properties.deltaY || 0)
              };
            }
            // 处理其他属性更新
            return { ...el, ...properties };
          }
          return el;
        });
      } else {
        // 单个元素更新
        newElements = prevElements.map(el => 
          el.id === id ? { ...el, ...properties } : el
        );
      }
      
      // 使用函数式更新确保状态一致性
      setTimeout(() => {
        addToHistory(newElements);
      }, 0);
      
      return newElements;
    });
  };

  // 删除选中的元素
  const deleteSelectedElements = () => {
    if (selectedElements.length > 0) {
      const newElements = elements.filter(el => !selectedElements.includes(el.id));
      setElements(newElements);
      setSelectedElements([]);
      setActiveToolbar(null);
      addToHistory(newElements); 
    }
  };

  const handleRedo = () => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      // 获取下一个历史状态的所有元素
      const nextState = history[newIndex];
      
      // 确保是有效的数组
      if (nextState) {
        // 更新所有元素的状态
        setElements([...nextState]);
        setCurrentIndex(newIndex);
        
        // 清除选中状态
        setSelectedElements([]);
        setActiveToolbar(null);
        
        debouncedSaveToIndexedDB({
          elements: nextState,
          history: history,
          currentIndex: newIndex
        });
      }
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

    const element = elements.find(el => el.id === id);
    if (element) {
      setActiveToolbar(element.type);
    }
  };

  const clearSelection = () => {
    setSelectedElements([]);
    setActiveToolbar(null);
  };

  // 清除画布
  const clearCanvas = () => {
    setElements([]);
    setSelectedElements([]);
    setActiveToolbar(null);
    addToHistory([]);
  };

  // 添加复制功能
  const handleCopy = (e) => {
    // 检查是否按下 Ctrl + C
    if (e.ctrlKey && e.key === 'c' && selectedElements.length > 0) {
      const elementsToCopy = selectedElements.map(id => {
        const element = elements.find(el => el.id === id);
        if (!element) return null;
        
        // 创建新的元素，基于原始元素
        return {
          ...element,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          x: element.x + 20, // 偏移复制的元素，使其可见
          y: element.y + 20
        };
      }).filter(Boolean);

      // 将复制的元素添加到画布
      const newElements = [...elements, ...elementsToCopy];
      setElements(newElements);
      
      // 选中新复制的元素
      setSelectedElements(elementsToCopy.map(el => el.id));
      
      // 添加到历史记录
      addToHistory(newElements);
    }
  };

  // 添加键盘事件监听
  useEffect(() => {
    window.addEventListener('keydown', handleCopy);
    return () => {
      window.removeEventListener('keydown', handleCopy);
    };
  }, [elements, selectedElements]); // 依赖项更新

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
        addToHistory,
        clearCanvas,
        isLoading,
        handleCopy,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};