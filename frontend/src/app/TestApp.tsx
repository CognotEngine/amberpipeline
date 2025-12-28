import React from 'react';
import { CanvasProvider } from '../modules/canvas/composables/CanvasContext';
import { MainCanvas } from '../modules/canvas/MainCanvas';

/**
 * 简化测试应用
 * 用于验证新的属性面板功能
 */
export const TestApp: React.FC = () => {
  const testTabs = [
    { 
      id: 'test-tab-1', 
      title: '测试画布 1', 
      mode: 'precision-cut' as const, 
      content: { 
        imagePath: '/test-image.jpg',
        layers: [
          {
            id: 'layer-1',
            name: '背景层',
            type: 'background' as const,
            zIndex: -1,
            opacity: 1,
            visible: true,
            locked: false,
            imagePath: '/background.jpg'
          },
          {
            id: 'layer-2',
            name: '对象1',
            type: 'object' as const,
            zIndex: 0,
            opacity: 1,
            visible: true,
            locked: false,
            imagePath: '/object1.png',
            maskPath: '/object1_mask.png',
            properties: {
              inpaintSettings: {
                algorithm: 'Lama' as const,
                steps: 30,
                padding: 10
              }
            }
          }
        ]
      } 
    }
  ];

  return (
    <div className="h-screen bg-background text-foreground">
      <CanvasProvider>
        <MainCanvas 
          tabs={testTabs}
          activeTabId="test-tab-1"
          currentMode="precision-cut"
          onTabCreate={() => console.log('创建标签页')}
          onTabClose={() => console.log('关闭标签页')}
          onTabSelect={() => console.log('选择标签页')}
          onImport={() => console.log('导入文件')}
          onProcessingChange={() => console.log('处理状态变化')}
          className="h-full"
        />
      </CanvasProvider>
    </div>
  );
};