#!/usr/bin/env python3
"""
AmberPipeline AI - 图像处理基础模块
提供基础的图像处理功能，包括图片加载、保存、缩放、格式转换等
"""

import os
from PIL import Image, ImageOps, ImageDraw, ImageFilter
import numpy as np

class ImageProcessor:
    """图像处理类"""
    
    def __init__(self, config):
        """
        初始化图像处理类
        
        Args:
            config: 配置对象
        """
        self.config = config
    
    def load_image(self, file_path: str) -> Image.Image:
        """
        加载图片
        
        Args:
            file_path: 图片文件路径
        
        Returns:
            加载后的Image对象，如果加载失败则返回None
        """
        try:
            image = Image.open(file_path)
            # 确保图片是RGBA格式
            if image.mode != 'RGBA':
                image = image.convert('RGBA')
            return image
        except Exception as e:
            print(f"加载图片失败: {file_path}, 错误信息: {str(e)}")
            return None
    
    def save_image(self, image: Image.Image, file_path: str) -> bool:
        """
        保存图片
        
        Args:
            image: 要保存的Image对象
            file_path: 保存路径
        
        Returns:
            保存成功返回True，失败返回False
        """
        try:
            # 创建父目录
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            # 根据文件扩展名选择保存格式
            ext = os.path.splitext(file_path)[1].lower()
            if ext == '.png':
                # PNG格式支持透明通道
                image.save(file_path, format='PNG', optimize=True)
            elif ext in ['.jpg', '.jpeg']:
                # JPG格式不支持透明通道，转换为RGB
                if image.mode == 'RGBA':
                    # 创建白色背景
                    background = Image.new('RGB', image.size, (255, 255, 255))
                    background.paste(image, mask=image.split()[3])
                    background.save(file_path, format='JPEG', quality=95, optimize=True)
                else:
                    image.save(file_path, format='JPEG', quality=95, optimize=True)
            else:
                # 其他格式使用默认保存方式
                image.save(file_path, optimize=True)
            
            return True
        except Exception as e:
            print(f"保存图片失败: {file_path}, 错误信息: {str(e)}")
            return False
    
    def resize(self, image: Image.Image, target_size: tuple[int, int]) -> Image.Image:
        """
        缩放图片到目标尺寸
        
        Args:
            image: 原始Image对象
            target_size: 目标尺寸 (width, height)
        
        Returns:
            缩放后的Image对象
        """
        try:
            # 使用高质量缩放算法
            resized_image = image.resize(target_size, Image.LANCZOS)
            return resized_image
        except Exception as e:
            print(f"缩放图片失败, 错误信息: {str(e)}")
            return image
    
    def convert_to_grayscale(self, image: Image.Image) -> Image.Image:
        """
        将图片转换为灰度图
        
        Args:
            image: 原始Image对象
        
        Returns:
            灰度图Image对象
        """
        try:
            return image.convert('L')
        except Exception as e:
            print(f"转换为灰度图失败, 错误信息: {str(e)}")
            return image
    
    def image_to_numpy(self, image: Image.Image) -> np.ndarray:
        """
        将Image对象转换为numpy数组
        
        Args:
            image: Image对象
        
        Returns:
            numpy数组，形状为 (height, width, channels)
        """
        return np.array(image)
    
    def numpy_to_image(self, array: np.ndarray) -> Image.Image:
        """
        将numpy数组转换为Image对象
        
        Args:
            array: numpy数组，形状为 (height, width, channels)
        
        Returns:
            Image对象
        """
        # 确保数组值在0-255范围内
        array = np.clip(array, 0, 255).astype(np.uint8)
        return Image.fromarray(array)
    
    def add_alpha_channel(self, image: Image.Image) -> Image.Image:
        """
        为图片添加透明通道
        
        Args:
            image: 原始Image对象
        
        Returns:
            添加透明通道后的Image对象
        """
        if image.mode == 'RGBA':
            return image
        elif image.mode == 'RGB':
            return image.convert('RGBA')
        elif image.mode == 'L':
            return image.convert('RGBA')
        else:
            return image.convert('RGBA')
    
    def invert_colors(self, image: Image.Image) -> Image.Image:
        """
        反转图片颜色
        
        Args:
            image: 原始Image对象
        
        Returns:
            颜色反转后的Image对象
        """
        return ImageOps.invert(image)
    
    def align_bottom(self, image: Image.Image, padding: int = 0) -> Image.Image:
        """
        将人物对齐到图像底部中心
        
        Args:
            image: 原始Image对象
            padding: 底部padding
            
        Returns:
            对齐后的Image对象
        """
        try:
            # 获取alpha通道
            alpha = image.split()[3]
            
            # 找到非透明区域的边界
            bbox = alpha.getbbox()
            if not bbox:
                return image
            
            # 计算偏移量
            offset_x = (image.width - (bbox[2] - bbox[0])) // 2
            offset_y = image.height - (bbox[3] - bbox[1]) - padding
            
            # 创建新图像
            new_image = Image.new('RGBA', image.size, (0, 0, 0, 0))
            
            # 粘贴图像到新位置
            new_image.paste(image.crop(bbox), (offset_x, offset_y))
            
            return new_image
        except Exception as e:
            print(f"对齐底部失败, 错误信息: {str(e)}")
            return image
    
    def generate_shadow(self, image: Image.Image, shadow_color: tuple = (0, 0, 0, 100), shadow_size: int = 50) -> Image.Image:
        """
        生成半透明椭圆投影
        
        Args:
            image: 原始Image对象
            shadow_color: 阴影颜色 (R, G, B, A)
            shadow_size: 阴影大小
            
        Returns:
            带阴影的Image对象
        """
        try:
            # 获取alpha通道
            alpha = image.split()[3]
            
            # 找到非透明区域的边界
            bbox = alpha.getbbox()
            if not bbox:
                return image
            
            # 创建阴影图像
            shadow = Image.new('RGBA', image.size, (0, 0, 0, 0))
            shadow_draw = ImageDraw.Draw(shadow)
            
            # 计算阴影位置和大小
            shadow_x = (bbox[0] + bbox[2]) // 2 - shadow_size // 2
            shadow_y = bbox[3] - shadow_size // 4
            
            # 绘制半透明椭圆阴影
            shadow_draw.ellipse(
                [shadow_x, shadow_y, shadow_x + shadow_size, shadow_y + shadow_size // 2],
                fill=shadow_color
            )
            
            # 合并图像和阴影
            result = Image.alpha_composite(shadow, image)
            
            return result
        except Exception as e:
            print(f"生成阴影失败, 错误信息: {str(e)}")
            return image
    
    def resize_square(self, image: Image.Image, target_size: int = 512) -> Image.Image:
        """
        正方形裁切并缩放
        
        Args:
            image: 原始Image对象
            target_size: 目标尺寸 (width = height)
            
        Returns:
            正方形缩放后的Image对象
        """
        try:
            # 计算正方形裁切区域
            width, height = image.size
            square_size = min(width, height)
            
            # 居中裁切
            left = (width - square_size) // 2
            top = (height - square_size) // 2
            right = left + square_size
            bottom = top + square_size
            
            # 裁切并缩放
            cropped = image.crop((left, top, right, bottom))
            resized = cropped.resize((target_size, target_size), Image.LANCZOS)
            
            return resized
        except Exception as e:
            print(f"正方形裁切失败, 错误信息: {str(e)}")
            return image
    
    def sharpen(self, image: Image.Image, factor: float = 1.5) -> Image.Image:
        """
        边缘强化
        
        Args:
            image: 原始Image对象
            factor: 锐化因子
            
        Returns:
            锐化后的Image对象
        """
        try:
            # 使用PIL的锐化滤镜
            sharpened = image.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))
            return sharpened
        except Exception as e:
            print(f"边缘强化失败, 错误信息: {str(e)}")
            return image
    
    def make_seamless(self, image: Image.Image) -> Image.Image:
        """
        无缝化处理
        
        Args:
            image: 原始Image对象
            
        Returns:
            无缝化处理后的Image对象
        """
        try:
            # 简单的边缘融合方法：镜像翻转边缘像素
            width, height = image.size
            
            # 创建新图像，四周扩展
            extended = Image.new('RGBA', (width + 2, height + 2), (0, 0, 0, 0))
            extended.paste(image, (1, 1))
            
            # 镜像复制边缘
            # 顶部边缘
            extended.paste(image.crop((0, 0, width, 1)).transpose(Image.FLIP_TOP_BOTTOM), (1, 0))
            # 底部边缘
            extended.paste(image.crop((0, height - 1, width, height)).transpose(Image.FLIP_TOP_BOTTOM), (1, height + 1))
            # 左侧边缘
            extended.paste(image.crop((0, 0, 1, height)).transpose(Image.FLIP_LEFT_RIGHT), (0, 1))
            # 右侧边缘
            extended.paste(image.crop((width - 1, 0, width, height)).transpose(Image.FLIP_LEFT_RIGHT), (width + 1, 1))
            
            # 角落
            extended.paste(image.crop((0, 0, 1, 1)).transpose(Image.ROTATE_180), (0, 0))
            extended.paste(image.crop((width - 1, 0, width, 1)).transpose(Image.ROTATE_180), (width + 1, 0))
            extended.paste(image.crop((0, height - 1, 1, height)).transpose(Image.ROTATE_180), (0, height + 1))
            extended.paste(image.crop((width - 1, height - 1, width, height)).transpose(Image.ROTATE_180), (width + 1, height + 1))
            
            # 使用高斯模糊进行边缘融合
            blurred = extended.filter(ImageFilter.GaussianBlur(radius=1))
            
            # 裁剪回原始尺寸
            result = blurred.crop((1, 1, width + 1, height + 1))
            
            return result
        except Exception as e:
            print(f"无缝化处理失败, 错误信息: {str(e)}")
            return image
    
    def gen_lod(self, image: Image.Image, levels: int = 3) -> list[Image.Image]:
        """
        生成LOD级别
        
        Args:
            image: 原始Image对象
            levels: 生成的LOD级别数量
            
        Returns:
            LOD级别列表，从高到低
        """
        try:
            lods = [image]
            current_width, current_height = image.size
            
            for i in range(1, levels):
                # 每次缩小一半
                new_width = max(32, current_width // 2)
                new_height = max(32, current_height // 2)
                
                lod_image = image.resize((new_width, new_height), Image.LANCZOS)
                lods.append(lod_image)
                
                current_width, current_height = new_width, new_height
            
            return lods
        except Exception as e:
            print(f"生成LOD失败, 错误信息: {str(e)}")
            return [image]
    
    def box_collision(self, image: Image.Image) -> tuple:
        """
        生成碰撞体边界
        
        Args:
            image: 原始Image对象
            
        Returns:
            碰撞体边界坐标 (left, top, right, bottom)
        """
        try:
            # 获取alpha通道
            alpha = image.split()[3]
            
            # 找到非透明区域的边界
            bbox = alpha.getbbox()
            if not bbox:
                return (0, 0, image.width, image.height)
            
            return bbox
        except Exception as e:
            print(f"生成碰撞体失败, 错误信息: {str(e)}")
            return (0, 0, image.width, image.height)
