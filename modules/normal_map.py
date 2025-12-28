#!/usr/bin/env python3
"""
AmberPipeline AI - Normal Map Generation Module
Generates PBR normal maps from 2D images, supporting multiple generation algorithms
"""

import os
import numpy as np
from PIL import Image, ImageFilter

class NormalMapGenerator:
    """Normal map generation class"""
    
    def __init__(self, config):
        """
        Initialize the normal map generator
        
        Args:
            config: Configuration object
        """
        self.config = config
    
    def generate(self, image_path: str, strength: float = None) -> Image.Image:
        """
        Generate normal map from image
        
        Args:
            image_path: Image file path
            strength: Normal strength, overrides the value in configuration file
        
        Returns:
            Generated normal map Image object, returns None if generation fails
        """
        try:
            # Load image
            image = Image.open(image_path)
            
            # Use specified strength or the one from configuration file
            current_strength = strength if strength is not None else self.config.normal_strength
            
            # Generate normal map using improved Sobel operator
            normal_map = self._improved_sobel_normal_map(image, current_strength)
            
            return normal_map
            
        except Exception as e:
            print(f"Failed to generate normal map: {image_path}, Error: {str(e)}")
            return None
    
    def _sobel_normal_map(self, gray_image: Image.Image) -> Image.Image:
        """
        Generate normal map using Sobel operator
        
        Args:
            gray_image: Grayscale image Image object
        
        Returns:
            Generated normal map Image object
        """
        # Convert to numpy array
        gray_np = np.array(gray_image, dtype=np.float32) / 255.0
        
        # Apply blur to reduce noise
        if self.config.normal_blur > 0:
            blur_image = Image.fromarray((gray_np * 255).astype(np.uint8))
            blur_image = blur_image.filter(ImageFilter.GaussianBlur(radius=self.config.normal_blur))
            gray_np = np.array(blur_image, dtype=np.float32) / 255.0
        
        # Sobel operators
        sobel_x = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])
        sobel_y = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]])
        
        # Calculate gradients
        height, width = gray_np.shape
        gradient_x = np.zeros_like(gray_np)
        gradient_y = np.zeros_like(gray_np)
        
        # Convolution operation
        for i in range(1, height - 1):
            for j in range(1, width - 1):
                gradient_x[i, j] = np.sum(gray_np[i-1:i+2, j-1:j+2] * sobel_x)
                gradient_y[i, j] = np.sum(gray_np[i-1:i+2, j-1:j+2] * sobel_y)
        
        # Calculate normal vectors
        strength = self.config.normal_strength
        normals = np.zeros((height, width, 3), dtype=np.float32)
        
        normals[:, :, 0] = -gradient_x * strength
        normals[:, :, 1] = -gradient_y * strength
        normals[:, :, 2] = 1.0
        
        # Normalize normal vectors
        norm = np.sqrt(normals[:, :, 0]**2 + normals[:, :, 1]**2 + normals[:, :, 2]**2)
        norm = np.maximum(norm, 1e-10)  # Avoid division by zero
        
        normals[:, :, 0] /= norm
        normals[:, :, 1] /= norm
        normals[:, :, 2] /= norm
        
        # Convert to RGB color space (normal map format)
        # Normal map format: R=X, G=Y, B=Z, range from [-1, 1] mapped to [0, 255]
        normal_map = (normals + 1.0) * 0.5 * 255.0
        normal_map = normal_map.astype(np.uint8)
        
        # Create Image object
        normal_image = Image.fromarray(normal_map)
        
        return normal_image
    
    def _simple_normal_map(self, gray_image: Image.Image) -> Image.Image:
        """
        Generate normal map using simple difference method
        
        Args:
            gray_image: Grayscale image Image object
        
        Returns:
            Generated normal map Image object
        """
        # Convert to numpy array
        gray_np = np.array(gray_image, dtype=np.float32) / 255.0
        
        height, width = gray_np.shape
        normals = np.zeros((height, width, 3), dtype=np.float32)
        
        # Simple difference gradient calculation
        for i in range(height):
            for j in range(width):
                dx = gray_np[i, min(j+1, width-1)] - gray_np[i, max(j-1, 0)]
                dy = gray_np[min(i+1, height-1), j] - gray_np[max(i-1, 0), j]
                
                normals[i, j, 0] = -dx * self.config.normal_strength
                normals[i, j, 1] = -dy * self.config.normal_strength
                normals[i, j, 2] = 1.0
        
        # Normalize
        norm = np.sqrt(normals[:, :, 0]**2 + normals[:, :, 1]**2 + normals[:, :, 2]**2)
        norm = np.maximum(norm, 1e-10)
        
        normals[:, :, 0] /= norm
        normals[:, :, 1] /= norm
        normals[:, :, 2] /= norm
        
        # Convert to RGB color space
        normal_map = (normals + 1.0) * 0.5 * 255.0
        normal_map = normal_map.astype(np.uint8)
        
        return Image.fromarray(normal_map)
    
    def _improved_sobel_normal_map(self, input_image: Image.Image, strength: float) -> Image.Image:
        """
        Generate high-quality normal map using improved Sobel operator
        
        Args:
            input_image: Input image (can be color or grayscale)
            strength: Normal map strength
        
        Returns:
            Generated normal map Image object
        """
        # If it's a color image, convert to grayscale and enhance contrast
        if input_image.mode == 'RGBA':
            # Process transparent channel, use alpha channel as mask
            r, g, b, a = input_image.split()
            input_image = Image.merge('RGB', (r, g, b))
            alpha_mask = a
        elif input_image.mode == 'RGB':
            alpha_mask = None
        
        # Convert to grayscale and enhance contrast
        gray_image = input_image.convert('L')
        
        # Apply adaptive histogram equalization to enhance contrast
        gray_image = self._adaptive_histogram_equalization(gray_image)
        
        # Convert to numpy array
        gray_np = np.array(gray_image, dtype=np.float32) / 255.0
        
        # Apply multi-level blur processing to reduce noise while preserving details
        if self.config.normal_blur > 0:
            # First apply slight Gaussian blur to remove high-frequency noise
            blur_kernel = int(self.config.normal_blur * 2) + 1
            blur_image = gray_image.filter(ImageFilter.GaussianBlur(radius=self.config.normal_blur))
            gray_np = np.array(blur_image, dtype=np.float32) / 255.0
        
        # Use more precise Sobel edge detection
        height, width = gray_np.shape
        
        # Optimized Sobel convolution kernels
        sobel_x = np.array([[-3, 0, 3], [-10, 0, 10], [-3, 0, 3]], dtype=np.float32)
        sobel_y = np.array([[-3, -10, -3], [0, 0, 0], [3, 10, 3]], dtype=np.float32)
        
        # Use numpy convolution for more efficient calculation
        gradient_x = self._convolve(gray_np, sobel_x)
        gradient_y = self._convolve(gray_np, sobel_y)
        
        # Edge thresholding to reduce the impact of weak edges
        edge_threshold = 0.05
        gradient_x = np.where(np.abs(gradient_x) < edge_threshold, 0, gradient_x)
        gradient_y = np.where(np.abs(gradient_y) < edge_threshold, 0, gradient_y)
        
        # Calculate normal vectors
        normals = np.zeros((height, width, 3), dtype=np.float32)
        
        normals[:, :, 0] = -gradient_x * strength
        normals[:, :, 1] = -gradient_y * strength
        normals[:, :, 2] = 1.0
        
        # Normalize normal vectors
        norm = np.sqrt(normals[:, :, 0]**2 + normals[:, :, 1]**2 + normals[:, :, 2]**2)
        norm = np.maximum(norm, 1e-10)  # Avoid division by zero
        
        normals[:, :, 0] /= norm
        normals[:, :, 1] /= norm
        normals[:, :, 2] /= norm
        
        # Smooth the normal map to reduce jagged edges
        normals = self._smooth_normals(normals)
        
        # Convert to RGB color space (normal map format)
        # Normal map format: R=X, G=Y, B=Z, range from [-1, 1] mapped to [0, 255]
        normal_map = (normals + 1.0) * 0.5 * 255.0
        normal_map = normal_map.astype(np.uint8)
        
        # Create Image object
        normal_image = Image.fromarray(normal_map)
        
        # If there's a transparent channel, apply it to the normal map
        if alpha_mask is not None:
            normal_image.putalpha(alpha_mask)
        
        return normal_image
    
    def _adaptive_histogram_equalization(self, image: Image.Image, clip_limit: float = 0.03, tile_size: tuple = (8, 8)) -> Image.Image:
        """
        Apply adaptive histogram equalization to enhance image contrast
        
        Args:
            image: Input image
            clip_limit: Contrast limit
            tile_size: Block size
        
        Returns:
            Image with enhanced contrast
        """
        import cv2
        import numpy as np
        
        # Convert to numpy array
        img_array = np.array(image, dtype=np.uint8)
        
        # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_size)
        clahe_img = clahe.apply(img_array)
        
        # Convert back to Image object
        return Image.fromarray(clahe_img)
    
    def _convolve(self, image: np.ndarray, kernel: np.ndarray) -> np.ndarray:
        """
        Perform 2D convolution operation
        
        Args:
            image: Input image array
            kernel: Convolution kernel
        
        Returns:
            Convolved image array
        """
        import scipy.signal
        
        # Use scipy's convolution function with 'same' edge handling mode
        return scipy.signal.convolve2d(image, kernel, mode='same', boundary='symm')
    
    def _smooth_normals(self, normals: np.ndarray) -> np.ndarray:
        """
        Smooth normal vectors to reduce jagged edges while maintaining direction consistency
        
        Args:
            normals: Normal vector array
        
        Returns:
            Smoothed normal vector array
        """
        # Apply slight Gaussian blur to the normal map
        import cv2
        
        # Separate XYZ channels
        x = normals[:, :, 0]
        y = normals[:, :, 1]
        z = normals[:, :, 2]
        
        # Apply Gaussian blur to each channel
        x = cv2.GaussianBlur(x, (3, 3), 0.5)
        y = cv2.GaussianBlur(y, (3, 3), 0.5)
        z = cv2.GaussianBlur(z, (3, 3), 0.5)
        
        # Recombine and normalize
        normals[:, :, 0] = x
        normals[:, :, 1] = y
        normals[:, :, 2] = z
        
        # Re-normalize normal vectors
        norm = np.sqrt(normals[:, :, 0]**2 + normals[:, :, 1]**2 + normals[:, :, 2]**2)
        norm = np.maximum(norm, 1e-10)  # Avoid division by zero
        
        normals[:, :, 0] /= norm
        normals[:, :, 1] /= norm
        normals[:, :, 2] /= norm
        
        return normals
    
    def generate_from_color(self, color_image: Image.Image) -> Image.Image:
        """
        Generate normal map from color image
        
        Args:
            color_image: Color image Image object
        
        Returns:
            Generated normal map Image object
        """
        return self._improved_sobel_normal_map(color_image, self.config.normal_strength)
