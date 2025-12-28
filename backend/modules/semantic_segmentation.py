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
    
    def __init__(self, model_path: str = None):
        """
        初始化语义分割模块
        
        Args:
            model_path (str, optional): 模型路径. Defaults to None.
        """
        self.model_path = model_path
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