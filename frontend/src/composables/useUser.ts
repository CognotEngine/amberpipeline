/**
 * 用户管理逻辑封装
 * 功能：封装用户状态管理、登录/登出、权限控制等用户相关业务逻辑
 */
import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../lib/api';

// 定义用户信息类型
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  avatar?: string;
  settings?: UserSettings;
}

// 定义用户设置类型
export interface UserSettings {
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  autoSave: boolean;
}

// 定义登录参数类型
export interface LoginParams {
  username: string;
  password: string;
}

// 定义注册参数类型
export interface RegisterParams {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * 用户管理Hook
 * @returns 用户管理相关的状态和方法
 */
export const useUser = () => {
  // 用户状态
  const [user, setUser] = useState<User | null>(null);
  // 登录状态
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // 加载状态
  const [isLoading, setIsLoading] = useState(false);
  // 错误信息
  const [error, setError] = useState<string | null>(null);

  /**
   * 检查本地存储中的用户信息
   */
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error('检查用户认证状态失败:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    };

    checkAuth();
  }, []);

  /**
   * 登录
   * @param params 登录参数
   * @returns 登录结果
   */
  const login = useCallback(async (params: LoginParams): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // 调用登录API
      const response = await apiClient.login('/auth/login', params);
      
      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        
        // 保存用户信息和令牌到本地存储
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        
        // 更新状态
        setUser(userData);
        setIsLoggedIn(true);
        
        return true;
      } else {
        setError(response.message || '登录失败');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '登录失败';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 登出
   */
  const logout = useCallback(async () => {
    try {
      // 调用登出API
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error('登出API调用失败:', err);
    } finally {
      // 清除本地存储和状态
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setIsLoggedIn(false);
    }
  }, []);

  /**
   * 注册
   * @param params 注册参数
   * @returns 注册结果
   */
  const register = useCallback(async (params: RegisterParams): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // 调用注册API
      const response = await apiClient.post('/auth/register', params);
      
      if (response.success) {
        return true;
      } else {
        setError(response.message || '注册失败');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '注册失败';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 更新用户信息
   * @param updates 更新的用户信息
   * @returns 更新结果
   */
  const updateUser = useCallback(async (updates: Partial<User>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!user) {
        setError('用户未登录');
        return false;
      }

      // 调用更新用户信息API
      const response = await apiClient.put('/user/update', updates);
      
      if (response.success && response.data) {
        const updatedUser = { ...user, ...response.data };
        
        // 更新本地存储和状态
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        return true;
      } else {
        setError(response.message || '更新用户信息失败');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新用户信息失败';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * 更新用户设置
   * @param settings 更新的用户设置
   * @returns 更新结果
   */
  const updateSettings = useCallback(async (settings: Partial<UserSettings>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!user) {
        setError('用户未登录');
        return false;
      }

      // 更新本地设置
      const updatedSettings: UserSettings = { 
        language: settings.language ?? user.settings?.language ?? 'zh-CN',
        theme: settings.theme ?? user.settings?.theme ?? 'system',
        notifications: settings.notifications ?? user.settings?.notifications ?? true,
        autoSave: settings.autoSave ?? user.settings?.autoSave ?? true
      };
      const updatedUser = { ...user, settings: updatedSettings };
      
      // 调用更新设置API
      const response = await apiClient.put('/user/settings', updatedSettings);
      
      if (response.success) {
        // 更新本地存储和状态
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        return true;
      } else {
        setError(response.message || '更新设置失败');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新设置失败';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * 检查用户权限
   * @param requiredRole 所需权限角色
   * @returns 是否具有所需权限
   */
  const hasPermission = useCallback((requiredRole: 'admin' | 'user' | 'guest'): boolean => {
    if (!isLoggedIn) {
      return requiredRole === 'guest';
    }

    const roleHierarchy: Record<string, number> = {
      guest: 0,
      user: 1,
      admin: 2
    };

    return roleHierarchy[user?.role || 'guest'] >= roleHierarchy[requiredRole];
  }, [isLoggedIn, user]);

  /**
   * 获取当前用户信息
   * @returns 用户信息
   */
  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // 调用获取用户信息API
      const response = await apiClient.get('/user/me');
      
      if (response.success && response.data) {
        const currentUser = response.data;
        
        // 更新本地存储和状态
        localStorage.setItem('user', JSON.stringify(currentUser));
        setUser(currentUser);
        setIsLoggedIn(true);
        
        return currentUser;
      } else {
        setError(response.message || '获取用户信息失败');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取用户信息失败';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // 状态
    user,
    isLoggedIn,
    isLoading,
    error,
    
    // 方法
    login,
    logout,
    register,
    updateUser,
    updateSettings,
    hasPermission,
    getCurrentUser
  };
};
