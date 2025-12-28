/**
 * 项目管理逻辑封装
 * 功能：封装项目的创建、更新、删除、加载等项目管理相关业务逻辑
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { apiClient } from '../lib/api';
import type { Task } from '../types';

// 定义项目配置类型
export interface ProjectConfig {
  name: string;
  description?: string;
  version: string;
  template?: string;
  settings?: ProjectSettings;
}

// 定义项目设置类型
export interface ProjectSettings {
  autoSave: boolean;
  saveInterval: number;
  canvasSize: { width: number; height: number };
  defaultMode: 'precision-cut' | 'character-layer' | 'skeleton-binding';
  exportFormat: 'png' | 'jpg' | 'tga' | 'psd';
}

// 定义项目元数据类型
export interface ProjectMetadata {
  id: string;
  name: string;
  description?: string;
  version: string;
  createdAt: number;
  updatedAt: number;
  author: string;
  thumbnail?: string;
  status: 'active' | 'archived' | 'draft';
  taskCount: number;
  completedTaskCount: number;
}

// 定义项目类型
export interface Project {
  id: string;
  metadata: ProjectMetadata;
  config: ProjectConfig;
  tasks: Task[];
  data: any;
}

/**
 * 项目管理Hook
 * @returns 项目管理相关的状态和方法
 */
export const useProject = () => {
  // 当前项目
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  // 项目列表
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  // 加载状态
  const [isLoading, setIsLoading] = useState(false);
  // 错误信息
  const [error, setError] = useState<string | null>(null);
  // 保存状态
  const [isSaving, setIsSaving] = useState(false);
  // 自动保存定时器
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 初始化项目列表
   */
  useEffect(() => {
    loadProjects();
  }, []);

  /**
   * 清理自动保存定时器
   */
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, []);

  /**
   * 加载项目列表
   */
  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 调用加载项目列表API
      const response = await apiClient.get('/projects');
      
      if (response.success && response.data) {
        setProjects(response.data);
      } else {
        setError(response.message || '加载项目列表失败');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载项目列表失败';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 创建新项目
   * @param config 项目配置
   * @returns 创建的项目
   */
  const createProject = useCallback(async (config: ProjectConfig): Promise<Project | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // 调用创建项目API
      const response = await apiClient.post('/projects', config);
      
      if (response.success && response.data) {
        const newProject = response.data;
        
        // 更新项目列表
        setProjects(prev => [...prev, newProject.metadata]);
        // 设置为当前项目
        setCurrentProject(newProject);
        
        // 启动自动保存
        startAutoSave(newProject.config.settings?.autoSave || false, newProject.config.settings?.saveInterval || 30000);
        
        return newProject;
      } else {
        setError(response.message || '创建项目失败');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建项目失败';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 加载项目
   * @param projectId 项目ID
   * @returns 加载的项目
   */
  const loadProject = useCallback(async (projectId: string): Promise<Project | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // 调用加载项目API
      const response = await apiClient.get(`/projects/${projectId}`);
      
      if (response.success && response.data) {
        const loadedProject = response.data;
        
        // 设置为当前项目
        setCurrentProject(loadedProject);
        
        // 启动自动保存
        startAutoSave(loadedProject.config.settings?.autoSave || false, loadedProject.config.settings?.saveInterval || 30000);
        
        return loadedProject;
      } else {
        setError(response.message || '加载项目失败');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载项目失败';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 保存项目
   * @param projectId 项目ID（可选，默认使用当前项目）
   * @returns 保存结果
   */
  const saveProject = useCallback(async (projectId?: string): Promise<boolean> => {
    const id = projectId || currentProject?.id;
    
    if (!id || !currentProject) {
      setError('没有可保存的项目');
      return false;
    }
    
    setIsSaving(true);
    setError(null);

    try {
      // 调用保存项目API
      const response = await apiClient.put(`/projects/${id}`, currentProject);
      
      if (response.success && response.data) {
        // 更新项目列表中的元数据
        setProjects(prev => prev.map(project => 
          project.id === id ? response.data.metadata : project
        ));
        
        return true;
      } else {
        setError(response.message || '保存项目失败');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '保存项目失败';
      setError(errorMessage);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [currentProject]);

  /**
   * 删除项目
   * @param projectId 项目ID
   * @returns 删除结果
   */
  const deleteProject = useCallback(async (projectId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // 调用删除项目API
      const response = await apiClient.delete(`/projects/${projectId}`);
      
      if (response.success) {
        // 从项目列表中移除
        setProjects(prev => prev.filter(project => project.id !== projectId));
        
        // 如果删除的是当前项目，清空当前项目
        if (currentProject?.id === projectId) {
          setCurrentProject(null);
          // 停止自动保存
          stopAutoSave();
        }
        
        return true;
      } else {
        setError(response.message || '删除项目失败');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除项目失败';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  /**
   * 更新项目配置
   * @param projectId 项目ID（可选，默认使用当前项目）
   * @param config 更新的项目配置
   * @returns 更新结果
   */
  const updateProjectConfig = useCallback(async (projectId: string | undefined, config: Partial<ProjectConfig>): Promise<boolean> => {
    const id = projectId || currentProject?.id;
    
    if (!id || !currentProject) {
      setError('没有可更新的项目');
      return false;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // 更新本地项目配置
      const updatedProject = {
        ...currentProject,
        config: { ...currentProject.config, ...config },
        metadata: {
          ...currentProject.metadata,
          name: config.name || currentProject.metadata.name,
          description: config.description || currentProject.metadata.description,
          updatedAt: Date.now()
        }
      };
      
      // 调用更新项目API
      const response = await apiClient.put(`/projects/${id}/config`, config);
      
      if (response.success) {
        // 更新当前项目
        setCurrentProject(updatedProject);
        
        // 更新项目列表中的元数据
        setProjects(prev => prev.map(project => 
          project.id === id ? updatedProject.metadata : project
        ));
        
        // 重启自动保存（如果配置有变化）
        if (config.settings?.autoSave !== undefined || config.settings?.saveInterval !== undefined) {
          startAutoSave(
            config.settings?.autoSave || updatedProject.config.settings?.autoSave || false,
            config.settings?.saveInterval || updatedProject.config.settings?.saveInterval || 30000
          );
        }
        
        return true;
      } else {
        setError(response.message || '更新项目配置失败');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新项目配置失败';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  /**
   * 导出项目
   * @param projectId 项目ID（可选，默认使用当前项目）
   * @param format 导出格式
   * @returns 导出结果
   */
  const exportProject = useCallback(async (projectId?: string, format?: 'png' | 'jpg' | 'tga' | 'psd'): Promise<string | null> => {
    const id = projectId || currentProject?.id;
    const exportFormat = format || currentProject?.config.settings?.exportFormat || 'png';
    
    if (!id) {
      setError('没有可导出的项目');
      return null;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // 调用导出项目API
      const response = await apiClient.post(`/projects/${id}/export`, { format: exportFormat });
      
      if (response.success && response.data?.downloadUrl) {
        return response.data.downloadUrl;
      } else {
        setError(response.message || '导出项目失败');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '导出项目失败';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  /**
   * 导入项目
   * @param file 项目文件
   * @returns 导入结果
   */
  const importProject = useCallback(async (file: File): Promise<Project | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // 调用导入项目API
      const response = await apiClient.post('/projects/import', formData);
      
      if (response.success && response.data) {
        const importedProject = response.data;
        
        // 更新项目列表
        setProjects(prev => [...prev, importedProject.metadata]);
        
        // 设置为当前项目
        setCurrentProject(importedProject);
        
        // 启动自动保存
        startAutoSave(importedProject.config.settings?.autoSave || false, importedProject.config.settings?.saveInterval || 30000);
        
        return importedProject;
      } else {
        setError(response.message || '导入项目失败');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '导入项目失败';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 切换项目状态
   * @param projectId 项目ID
   * @param status 新状态
   * @returns 切换结果
   */
  const toggleProjectStatus = useCallback(async (projectId: string, status: 'active' | 'archived' | 'draft'): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // 调用切换项目状态API
      const response = await apiClient.put(`/projects/${projectId}/status`, { status });
      
      if (response.success && response.data) {
        // 更新项目列表中的状态
        setProjects(prev => prev.map(project => 
          project.id === projectId ? { ...project, status } : project
        ));
        
        // 如果是当前项目，更新当前项目的状态
        if (currentProject?.id === projectId) {
          setCurrentProject(prev => 
            prev ? { ...prev, metadata: { ...prev.metadata, status } } : null
          );
        }
        
        return true;
      } else {
        setError(response.message || '切换项目状态失败');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '切换项目状态失败';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  /**
   * 启动自动保存
   * @param enable 是否启用自动保存
   * @param interval 保存间隔（毫秒）
   */
  const startAutoSave = useCallback((enable: boolean, interval: number) => {
    // 停止现有定时器
    stopAutoSave();
    
    if (enable) {
      autoSaveTimerRef.current = setInterval(() => {
        saveProject();
      }, interval);
    }
  }, [saveProject]);

  /**
   * 停止自动保存
   */
  const stopAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  }, []);

  /**
   * 关闭当前项目
   */
  const closeCurrentProject = useCallback(() => {
    setCurrentProject(null);
    stopAutoSave();
  }, []);

  /**
   * 更新当前项目的任务列表
   * @param tasks 更新后的任务列表
   */
  const updateProjectTasks = useCallback((tasks: Task[]) => {
    if (!currentProject) return;
    
    setCurrentProject(prev => {
      if (!prev) return null;
      
      const updatedProject = {
        ...prev,
        tasks,
        metadata: {
          ...prev.metadata,
          taskCount: tasks.length,
          completedTaskCount: tasks.filter(task => task.status === 'completed').length,
          updatedAt: Date.now()
        }
      };
      
      return updatedProject;
    });
  }, [currentProject]);

  return {
    // 状态
    currentProject,
    projects,
    isLoading,
    isSaving,
    error,
    
    // 方法
    loadProjects,
    createProject,
    loadProject,
    saveProject,
    deleteProject,
    updateProjectConfig,
    exportProject,
    importProject,
    toggleProjectStatus,
    closeCurrentProject,
    updateProjectTasks,
    startAutoSave,
    stopAutoSave
  };
};
