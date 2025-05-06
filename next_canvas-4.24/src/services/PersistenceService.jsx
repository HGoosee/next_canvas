import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';

// 创建一个 Yjs 文档
const ydoc = new Y.Doc();

// 创建共享数据结构
const yElements = ydoc.getArray('elements');
const yHistory = ydoc.getArray('history');
const yMetadata = ydoc.getMap('metadata');

// 添加性能计时变量
let startTime = 0;

// 防抖函数
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};


const showToast = (message, duration = 3000) => {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 14px;
    z-index: 10000;
    transition: opacity 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  // 3秒后淡出并移除
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, duration);
};


let pageStartTime = performance.now();


if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    pageStartTime = performance.now();
  });
}

// 添加历史记录清理配置
const HISTORY_CONFIG = {
  maxAge: 24 * 60 * 60 * 1000, // 1天的毫秒数
  cleanupInterval: 12 * 60 * 60 * 1000, // 每12小时清理一次
};

// 清理过期历史记录的函数
const cleanupHistory = () => {
  try {
    const currentTime = Date.now();
    const timestamp = yMetadata.get('timestamp');
    
    if (timestamp && (currentTime - timestamp) > HISTORY_CONFIG.maxAge) {
      console.log('清理过期历史记录...');
      yHistory.delete(0, yHistory.length);
      // showToast('已清理过期的历史记录');
    }
  } catch (error) {
    console.error('清理历史记录失败:', error);
  }
};

// 添加新的函数用于获取最近的历史记录
const getRecentHistory = async () => {
  const recentHistoryLength = 1;
  const history = yHistory.toArray();
  return history.slice(-recentHistoryLength);
};

// 添加新的函数用于后台加载完整历史记录
const loadFullHistory = async (callback) => {
  const fullHistory = yHistory.toArray();
  callback(fullHistory);
};


export const initPersistence = (docName, callback) => {
  startTime = performance.now();
  // 启动定期清理
  setInterval(cleanupHistory, HISTORY_CONFIG.cleanupInterval);
  const persistence = new IndexeddbPersistence(docName, ydoc);
  
  persistence.on('synced', async () => {
    console.log('初始同步完成，加载时间:', performance.now() - startTime, 'ms');
    
    try {
      // 首先加载最近的历史记录和当前状态
      const currentElements = yElements.toArray();
      const recentHistory = await getRecentHistory();
      
      if (callback && typeof callback === 'function') {
        callback({
          elements: currentElements,
          history: recentHistory,
          currentIndex: recentHistory.length - 1,
          isPartialHistory: true
        });

        // 使用 requestAnimationFrame 确保在下一帧渲染完成后计算时间
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const totalPageTime = performance.now() - pageStartTime;
            const loadTime = performance.now() - startTime;
            
            showToast(
              `页面加载完成:\n` +
              `总耗时: ${totalPageTime.toFixed(0)}ms\n` +
              `数据加载: ${loadTime.toFixed(0)}ms\n` +
              `元素数量: ${currentElements.length}`
            );
          });
        });

        // 后台加载完整历史记录
        setTimeout(async () => {
          await loadFullHistory((fullHistory) => {
            callback({
              elements: currentElements,
              history: fullHistory,
              currentIndex: fullHistory.length - 1,
              isPartialHistory: false
            });
          });
        }, 500);
      }
    } catch (error) {
      console.error('加载数据时出错:', error);
    }
  });

  return persistence;
};

// 保存数据到 IndexedDB
export const saveToIndexedDB = ({ elements, history, currentIndex }) => {
  try {
    // 添加数据验证
    if (!elements || !Array.isArray(elements)) {
      console.warn('无效的 elements 数据:', elements);
      return;
    }
    if (!history || !Array.isArray(history)) {
      console.warn('无效的 history 数据:', history);
      return;
    }
    if (typeof currentIndex !== 'number') {
      console.warn('无效的 currentIndex:', currentIndex);
      return;
    }

    console.log(`保存数据: ${elements.length} 个元素, 历史记录长度: ${history.length}`);
    
    // 清空并更新元素数组
    yElements.delete(0, yElements.length);
    yElements.insert(0, elements);
    
    // 清空并更新历史记录数组
    yHistory.delete(0, yHistory.length);
    yHistory.insert(0, history);
    
    console.log('历史记录已更新', history);
    // 更新元数据
    yMetadata.set('currentIndex', currentIndex);
    yMetadata.set('timestamp', Date.now());
    
    console.log('数据已保存到 IndexedDB');
  } catch (error) {
    console.error('保存到 IndexedDB 失败:', error);
  }
};

// 防抖版本的保存函数
export const debouncedSaveToIndexedDB = debounce(saveToIndexedDB, 300);

export { ydoc, yElements, yHistory, yMetadata };