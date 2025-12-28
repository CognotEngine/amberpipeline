#!/usr/bin/env python3
"""
测试 Inpainting 功能
"""

import os
import sys
import logging
from PIL import Image
import numpy as np

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import Config
from modules.inpainting import InpaintingProcessor

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_test_images():
    """
    创建测试图像和遮罩
    """
    # 创建测试图像（800x600，带有一些内容）
    width, height = 800, 600
    image = Image.new('RGB', (width, height), color='white')
    
    # 添加一些彩色矩形
    pixels = image.load()
    for y in range(height):
        for x in range(width):
            if 200 < x < 400 and 150 < y < 350:
                pixels[x, y] = (255, 0, 0)  # 红色
            elif 400 < x < 600 and 250 < y < 450:
                pixels[x, y] = (0, 255, 0)  # 绿色
    
    # 保存测试图像
    test_image_path = 'test_image.png'
    image.save(test_image_path)
    logger.info(f"Created test image: {test_image_path}")
    
    # 创建遮罩（白色区域将被修复）
    mask = Image.new('L', (width, height), color=0)
    mask_pixels = mask.load()
    
    # 在中心创建一个圆形遮罩
    center_x, center_y = width // 2, height // 2
    radius = 100
    for y in range(height):
        for x in range(width):
            if (x - center_x) ** 2 + (y - center_y) ** 2 < radius ** 2:
                mask_pixels[x, y] = 255
    
    # 保存遮罩
    test_mask_path = 'test_mask.png'
    mask.save(test_mask_path)
    logger.info(f"Created test mask: {test_mask_path}")
    
    return test_image_path, test_mask_path


def test_inpainting():
    """
    测试 Inpainting 功能
    """
    logger.info("Starting Inpainting test...")
    
    # 创建配置
    config = Config()
    
    # 创建测试图像
    image_path, mask_path = create_test_images()
    
    # 初始化 Inpainting 处理器
    processor = InpaintingProcessor(config, use_lama=False)
    
    # 测试不同的方法
    methods = processor.get_available_methods()
    logger.info(f"Available methods: {methods}")
    
    for method in methods:
        logger.info(f"\nTesting method: {method}")
        
        try:
            # 执行修复
            result = processor.inpaint(
                image_path,
                mask_path,
                method=method,
                radius=5,
                padding=10
            )
            
            # 保存结果
            output_path = f'test_inpaint_result_{method}.png'
            result.save(output_path)
            logger.info(f"Saved result to: {output_path}")
            
            # 估算处理时间
            estimated_time = processor.estimate_processing_time((800, 600), method)
            logger.info(f"Estimated processing time: {estimated_time:.2f}s")
            
        except Exception as e:
            logger.error(f"Failed to test method {method}: {str(e)}")
    
    # 清理测试文件
    # os.remove(image_path)
    # os.remove(mask_path)
    
    logger.info("\nInpainting test completed!")


if __name__ == "__main__":
    test_inpainting()
