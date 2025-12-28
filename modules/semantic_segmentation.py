#!/usr/bin/env python3
"""
语义分割模块
功能：实现人物部位分割，包括语义涂抹、边缘自动吸附、关节补全等功能
"""

import cv2
import numpy as np
from typing import List, Dict, Any, Tuple
import os
import tempfile
from PIL import Image

class SemanticSegmentation:
    """
    语义分割类
    功能：实现语义涂抹、边缘自动吸附、关节补全等功能
    """
    
    def __init__(self, config=None):
        """
        初始化语义分割模块
        
        Args:
            config: 配置对象
        """
        self.config = config
        self.parts_config = {
            'head': {'color': (255, 107, 107), 'label': 0},
            'body': {'color': (78, 205, 196), 'label': 1},
            'leftArm': {'color': (69, 183, 209), 'label': 2},
            'rightArm': {'color': (150, 206, 180), 'label': 3},
            'leftLeg': {'color': (255, 234, 167), 'label': 4},
            'rightLeg': {'color': (221, 160, 221), 'label': 5}
        }
    
    def perform_edge_snap(self, image_path: str, points: List[Dict[str, float]], label: str) -> Dict[str, Any]:
        """
        执行边缘自动吸附
        
        Args:
            image_path (str): 图像路径
            points (List[Dict[str, float]]): 点列表
            label (str): 标签类型 ('foreground' or 'background')
        
        Returns:
            Dict[str, Any]: 吸附结果
        """
        try:
            # 读取图像
            image = cv2.imread(image_path)
            if image is None:
                return {'success': False, 'error': '无法读取图像'}
            
            # 转换为灰度图
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # 计算边缘
            edges = cv2.Canny(gray, 100, 200)
            
            # 查找每个点附近的边缘
            snapped_points = []
            for point in points:
                x, y = int(point['x']), int(point['y'])
                
                # 在点周围查找边缘点
                edge_points = self._find_closest_edge_points(edges, (x, y), radius=50)
                
                if edge_points:
                    # 找到最近的边缘点
                    closest_edge = min(edge_points, key=lambda p: self._distance((x, y), p))
                    snapped_points.append({'x': closest_edge[0], 'y': closest_edge[1]})
                else:
                    # 如果没有找到边缘点，使用原始点
                    snapped_points.append({'x': x, 'y': y})
            
            return {
                'success': True,
                'snappedPoints': snapped_points
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def perform_joint_expansion(self, image_path: str, bbox: Dict[str, float], label: str) -> Dict[str, Any]:
        """
        执行关节补全
        
        Args:
            image_path (str): 图像路径
            bbox (Dict[str, float]): 边界框
            label (str): 标签类型 ('foreground' or 'background')
        
        Returns:
            Dict[str, Any]: 补全结果
        """
        try:
            # 读取图像
            image = cv2.imread(image_path)
            if image is None:
                return {'success': False, 'error': '无法读取图像'}
            
            # 获取边界框坐标
            x = int(bbox['x'])
            y = int(bbox['y'])
            width = int(bbox['width'])
            height = int(bbox['height'])
            
            # 确保边界框在图像范围内
            x = max(0, x)
            y = max(0, y)
            width = min(width, image.shape[1] - x)
            height = min(height, image.shape[0] - y)
            
            # 创建遮罩
            mask = np.zeros(image.shape[:2], dtype=np.uint8)
            cv2.rectangle(mask, (x, y), (x + width, y + height), 255, -1)
            
            # 应用膨胀操作来实现关节补全
            kernel = np.ones((5, 5), np.uint8)
            expanded_mask = cv2.dilate(mask, kernel, iterations=3)
            
            # 保存结果
            temp_file = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
            cv2.imwrite(temp_file.name, expanded_mask)
            temp_file.close()
            
            return {
                'success': True,
                'expandedMask': temp_file.name
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def apply_part_preset(self, image_path: str, preset_id: str) -> Dict[str, Any]:
        """
        应用部位预设
        
        Args:
            image_path (str): 图像路径
            preset_id (str): 预设ID
        
        Returns:
            Dict[str, Any]: 预设应用结果
        """
        try:
            # 读取图像
            image = cv2.imread(image_path)
            if image is None:
                return {'success': False, 'error': '无法读取图像'}
            
            # 简化实现，实际应该调用AI模型
            height, width = image.shape[:2]
            
            # 根据预设ID生成不同的部位遮罩
            parts = []
            if preset_id == 'human':
                # 生成简化的人体部位遮罩
                parts = self._generate_human_parts(width, height)
            elif preset_id == 'quadruped':
                # 生成简化的四足动物部位遮罩
                parts = self._generate_quadruped_parts(width, height)
            else:
                return {'success': False, 'error': f'未知的预设ID: {preset_id}'}
            
            # 为每个部位生成遮罩并保存
            result_parts = []
            for part in parts:
                # 创建遮罩
                mask = np.zeros((height, width), dtype=np.uint8)
                if part['type'] == 'head':
                    # 头部 - 圆形
                    cv2.circle(mask, (width//2, height//4), height//8, 255, -1)
                elif part['type'] == 'body':
                    # 身体 - 矩形
                    cv2.rectangle(mask, (width//3, height//3), (2*width//3, 3*height//4), 255, -1)
                elif part['type'] == 'leftArm':
                    # 左臂
                    cv2.rectangle(mask, (width//4, height//3), (width//3, height//2), 255, -1)
                elif part['type'] == 'rightArm':
                    # 右臂
                    cv2.rectangle(mask, (2*width//3, height//3), (3*width//4, height//2), 255, -1)
                elif part['type'] == 'leftLeg':
                    # 左腿
                    cv2.rectangle(mask, (width//3, 3*height//4), (width//2, height), 255, -1)
                elif part['type'] == 'rightLeg':
                    # 右腿
                    cv2.rectangle(mask, (width//2, 3*height//4), (2*width//3, height), 255, -1)
                
                # 保存遮罩
                temp_file = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
                cv2.imwrite(temp_file.name, mask)
                temp_file.close()
                
                result_parts.append({
                    'name': part['name'],
                    'type': part['type'],
                    'mask': temp_file.name
                })
            
            return {
                'success': True,
                'parts': result_parts
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def process_semantic_brush(self, image_path: str, strokes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        处理语义涂抹
        
        Args:
            image_path (str): 图像路径
            strokes (List[Dict[str, Any]]): 笔触列表
        
        Returns:
            Dict[str, Any]: 处理结果
        """
        try:
            # 读取图像
            image = cv2.imread(image_path)
            if image is None:
                return {'success': False, 'error': '无法读取图像'}
            
            height, width = image.shape[:2]
            
            # 创建遮罩
            mask = np.zeros((height, width), dtype=np.uint8)
            
            # 绘制笔触
            for stroke in strokes:
                x, y = int(stroke['x']), int(stroke['y'])
                size = int(stroke['size'])
                mode = stroke['mode']
                
                # 根据模式选择颜色
                if mode == 'eraser':
                    color = 0
                else:
                    color = 255
                
                # 绘制圆形笔触
                cv2.circle(mask, (x, y), size//2, color, -1)
            
            # 应用高斯模糊平滑遮罩
            smoothed_mask = cv2.GaussianBlur(mask, (15, 15), 0)
            
            # 保存结果
            temp_file = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
            cv2.imwrite(temp_file.name, smoothed_mask)
            temp_file.close()
            
            return {
                'success': True,
                'semanticMask': temp_file.name
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _find_closest_edge_points(self, edges: np.ndarray, center: Tuple[int, int], radius: int) -> List[Tuple[int, int]]:
        """
        查找中心周围的边缘点
        
        Args:
            edges (np.ndarray): 边缘图像
            center (Tuple[int, int]): 中心点
            radius (int): 搜索半径
        
        Returns:
            List[Tuple[int, int]]: 边缘点列表
        """
        height, width = edges.shape
        x, y = center
        
        # 确定搜索区域
        x_min = max(0, x - radius)
        x_max = min(width, x + radius)
        y_min = max(0, y - radius)
        y_max = min(height, y + radius)
        
        # 提取搜索区域
        search_region = edges[y_min:y_max, x_min:x_max]
        
        # 查找边缘点
        edge_points = []
        for dy in range(y_max - y_min):
            for dx in range(x_max - x_min):
                if search_region[dy, dx] > 0:
                    edge_points.append((x_min + dx, y_min + dy))
        
        return edge_points
    
    def _distance(self, p1: Tuple[int, int], p2: Tuple[int, int]) -> float:
        """
        计算两点之间的距离
        
        Args:
            p1 (Tuple[int, int]): 点1
            p2 (Tuple[int, int]): 点2
        
        Returns:
            float: 距离
        """
        return ((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2) ** 0.5
    
    def _generate_human_parts(self, width: int, height: int) -> List[Dict[str, str]]:
        """
        生成人体部位列表
        
        Args:
            width (int): 宽度
            height (int): 高度
        
        Returns:
            List[Dict[str, str]]: 部位列表
        """
        return [
            {'name': '头部', 'type': 'head'},
            {'name': '身体', 'type': 'body'},
            {'name': '左臂', 'type': 'leftArm'},
            {'name': '右臂', 'type': 'rightArm'},
            {'name': '左腿', 'type': 'leftLeg'},
            {'name': '右腿', 'type': 'rightLeg'}
        ]
    
    def _generate_quadruped_parts(self, width: int, height: int) -> List[Dict[str, str]]:
        """
        生成四足动物部位列表
        
        Args:
            width (int): 宽度
            height (int): 高度
        
        Returns:
            List[Dict[str, str]]: 部位列表
        """
        return [
            {'name': '头部', 'type': 'head'},
            {'name': '身体', 'type': 'body'},
            {'name': '左前腿', 'type': 'leftArm'},
            {'name': '右前腿', 'type': 'rightArm'},
            {'name': '左后腿', 'type': 'leftLeg'},
            {'name': '右后腿', 'type': 'rightLeg'}
        ]
