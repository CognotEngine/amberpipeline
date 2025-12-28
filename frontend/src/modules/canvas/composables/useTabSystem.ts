import { useState, useCallback, useEffect } from 'react';

// 标签页接口
export interface Tab {
  id: string;
  title: string;
  mode: 'precision-cut' | 'character-layer' | 'skeleton-binding' | 'animation';
  content: any;
}

interface TabSystemOptions {
  initialActiveTabId?: string;
  onTabCreate?: () => void;
  onTabClose?: (tabId: string) => void;
  onTabSelect?: (tabId: string) => void;
}

/**
 * 多页签系统Hook
 * 功能：封装多页签系统的标签创建、切换和关闭逻辑
 */
export const useTabSystem = (
  initialTabs: Tab[],
  options: TabSystemOptions = {}
) => {
  const { 
    initialActiveTabId,
    onTabCreate: externalOnTabCreate,
    onTabClose: externalOnTabClose,
    onTabSelect: externalOnTabSelect
  } = options;

  // 标签页列表
  const [tabs, setTabs] = useState<Tab[]>(initialTabs);
  // 当前激活的标签页ID
  const [activeTabId, setActiveTabId] = useState<string>(
    initialActiveTabId || (initialTabs.length > 0 ? initialTabs[0].id : '')
  );

  // 创建新标签页
  const createTab = useCallback((newTab: Omit<Tab, 'id'>) => {
    // 生成唯一ID
    const id = `tab-${Date.now()}`;
    const tabWithId = { ...newTab, id };
    
    setTabs(prev => [...prev, tabWithId]);
    // 自动激活新创建的标签页
    setActiveTabId(id);
    
    // 调用外部回调
    if (externalOnTabCreate) {
      externalOnTabCreate();
    }
    
    return id;
  }, [externalOnTabCreate]);

  // 选择标签页
  const selectTab = useCallback((tabId: string) => {
    // 检查标签页是否存在
    const tabExists = tabs.some(tab => tab.id === tabId);
    if (tabExists) {
      setActiveTabId(tabId);
      
      // 调用外部回调
      if (externalOnTabSelect) {
        externalOnTabSelect(tabId);
      }
    }
  }, [tabs, externalOnTabSelect]);

  // 关闭标签页
  const closeTab = useCallback((tabId: string) => {
    // 如果关闭的是当前激活的标签页，需要选择新的激活标签页
    if (activeTabId === tabId) {
      const currentIndex = tabs.findIndex(tab => tab.id === tabId);
      let newActiveId = '';
      
      if (tabs.length > 1) {
        // 如果有下一个标签页，激活下一个，否则激活上一个
        const newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : currentIndex - 1;
        newActiveId = tabs[newIndex].id;
      }
      
      setActiveTabId(newActiveId);
    }
    
    // 从列表中移除标签页
    setTabs(prev => prev.filter(tab => tab.id !== tabId));
    
    // 调用外部回调
    if (externalOnTabClose) {
      externalOnTabClose(tabId);
    }
  }, [tabs, activeTabId, externalOnTabClose]);

  // 更新标签页内容
  const updateTab = useCallback((tabId: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId ? { ...tab, ...updates } : tab
    ));
  }, []);

  // 当初始标签页变化时更新
  useEffect(() => {
    setTabs(initialTabs);
    // 如果初始激活标签页不存在或未指定，或者当前activeTabId不存在于新的initialTabs中，则激活第一个标签页
    if (initialTabs.length > 0) {
      const tabExists = initialTabs.some(tab => tab.id === activeTabId);
      const shouldUpdateActive = !initialActiveTabId || !tabExists;
      if (shouldUpdateActive) {
        setActiveTabId(initialTabs[0].id);
      }
    } else {
      setActiveTabId('');
    }
  }, [initialTabs, initialActiveTabId, activeTabId]);

  return {
    tabs,
    activeTabId,
    createTab,
    selectTab,
    closeTab,
    updateTab
  };
};
