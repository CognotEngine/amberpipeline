/**
 * JSX测试辅助函数
 * 功能：提供包含JSX的测试工具，简化组件测试流程
 */

import { render } from '@testing-library/react';
import { ThemeProvider } from '../themes/ThemeContext';
import { modernDarkTheme } from '../themes/modernDarkTheme';

/**
 * 使用主题渲染组件
 * 功能：将组件包裹在ThemeProvider中，使用现代深色主题进行渲染
 * @param component 要渲染的React组件
 * @returns 渲染结果
 */
export const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={modernDarkTheme}>
      {component}
    </ThemeProvider>
  );
};

/**
 * 使用浅色主题渲染组件
 * 功能：将组件包裹在ThemeProvider中，使用现代浅色主题进行渲染
 * @param component 要渲染的React组件
 * @returns 渲染结果
 */
export const renderWithLightTheme = (component: React.ReactElement) => {
  const { modernLightTheme } = require('../themes/modernLightTheme');
  return render(
    <ThemeProvider theme={modernLightTheme}>
      {component}
    </ThemeProvider>
  );
};

/**
 * 模拟API客户端响应
 * 功能：用于测试中模拟apiClient的响应
 * @param mockResponse 模拟的响应数据
 * @returns 模拟的apiClient
 */
export const mockApiClient = (mockResponse: any) => {
  return {
    getRoot: jest.fn().mockResolvedValue(mockResponse),
    segmentImage: jest.fn().mockResolvedValue(mockResponse),
    generateNormalMap: jest.fn().mockResolvedValue(mockResponse),
    startWorkflow: jest.fn().mockResolvedValue(mockResponse),
    stopWorkflow: jest.fn().mockResolvedValue(mockResponse),
    getWorkflowStatus: jest.fn().mockResolvedValue(mockResponse),
    processFile: jest.fn().mockResolvedValue(mockResponse),
    clearWorkflowHistory: jest.fn().mockResolvedValue(mockResponse),
    generateMetadata: jest.fn().mockResolvedValue(mockResponse),
    getBatchConfig: jest.fn().mockResolvedValue(mockResponse),
    setBatchConfig: jest.fn().mockResolvedValue(mockResponse),
    processAI: jest.fn().mockResolvedValue(mockResponse),
  };
};
