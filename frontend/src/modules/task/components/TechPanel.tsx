import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface TechPanelProps {
  // 面板标题
  title: string;
  // 默认是否展开
  defaultOpen?: boolean;
  // 是否显示边框
  bordered?: boolean;
  // 子组件
  children: React.ReactNode;
}

/**
 * 技术面板组件
 * 可折叠的面板组件，用于显示技术信息
 */
const TechPanel: React.FC<TechPanelProps> = ({ 
  title, 
  defaultOpen = false, 
  bordered = false, 
  children 
}) => {
  // 组件内部状态
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // 切换展开/折叠状态
  const toggleCollapse = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`tech-panel shadow-md ${bordered ? 'border border-[#333333]' : ''}`}>
      <div 
        className="panel-header flex items-center justify-between px-3 py-2 bg-[#252525] cursor-pointer border-b border-[#333333]"
        onClick={toggleCollapse}
      >
        <h3 className="text-sm font-medium text-gray-300">{title}</h3>
        <ChevronDown 
          size={16} 
          color="#ffffff" 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>
      {isOpen && (
        <div className="panel-content px-3 py-2 bg-[#202020] border-b border-l border-r border-[#333333]">
          {children}
        </div>
      )}

      <style>{`
        .tech-panel {
          width: 100%;
          transition: all 0.3s ease;
        }

        .panel-header {
          transition: background-color 0.2s ease;
        }

        .panel-header:hover {
          background-color: #2A2A2A;
        }

        .panel-content {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default TechPanel;