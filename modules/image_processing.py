#!/usr/bin/env python3
"""
AmberPipeline AI - Image Processing Base Module
Provides basic image processing functions, including image loading, saving, scaling, format conversion, etc.
"""

import os
import concurrent.futures
from PIL import Image, ImageOps, ImageDraw, ImageFilter
import numpy as np

class ImageProcessor:
    """Image Processing Class"""
    
    def __init__(self, config):
        """
        Initialize the image processing class
        
        Args:
            config: Configuration object
        """
        self.config = config
    
    def load_image(self, file_path: str) -> Image.Image:
        """
        Load image
        
        Args:
            file_path: Image file path
        
        Returns:
            Loaded Image object, returns None if loading fails
        """
        try:
            image = Image.open(file_path)
            # Ensure image is in RGBA format
            if image.mode != 'RGBA':
                image = image.convert('RGBA')
            return image
        except Exception as e:
            print(f"Failed to load image: {file_path}, error message: {str(e)}")
            return None
    
    def save_image(self, image: Image.Image, file_path: str) -> bool:
        """
        Save image
        
        Args:
            image: Image object to save
            file_path: Save path
        
        Returns:
            Returns True if save is successful, False otherwise
        """
        try:
            # Create parent directory
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            # Choose save format based on file extension
            ext = os.path.splitext(file_path)[1].lower()
            if ext == '.png':
                # PNG format supports transparency
                image.save(file_path, format='PNG', optimize=True)
            elif ext in ['.jpg', '.jpeg']:
                # JPG format does not support transparency, convert to RGB
                if image.mode == 'RGBA':
                    # Create white background
                    background = Image.new('RGB', image.size, (255, 255, 255))
                    background.paste(image, mask=image.split()[3])
                    background.save(file_path, format='JPEG', quality=95, optimize=True)
                else:
                    image.save(file_path, format='JPEG', quality=95, optimize=True)
            else:
                # Use default save method for other formats
                image.save(file_path, optimize=True)
            
            return True
        except Exception as e:
            print(f"Failed to save image: {file_path}, error message: {str(e)}")
            return False
    
    def resize(self, image: Image.Image, target_size: tuple[int, int]) -> Image.Image:
        """
        Resize image to target size
        
        Args:
            image: Original Image object
            target_size: Target size (width, height)
        
        Returns:
            Resized Image object
        """
        try:
            # Use high-quality resizing algorithm
            resized_image = image.resize(target_size, Image.LANCZOS)
            return resized_image
        except Exception as e:
            print(f"Failed to resize image, error message: {str(e)}")
            return image
    
    def convert_to_grayscale(self, image: Image.Image) -> Image.Image:
        """
        Convert image to grayscale
        
        Args:
            image: Original Image object
        
        Returns:
            Grayscale Image object
        """
        try:
            return image.convert('L')
        except Exception as e:
            print(f"Failed to convert to grayscale, error message: {str(e)}")
            return image
    
    def image_to_numpy(self, image: Image.Image) -> np.ndarray:
        """
        Convert Image object to numpy array
        
        Args:
            image: Image object
        
        Returns:
            numpy array with shape (height, width, channels)
        """
        return np.array(image)
    
    def numpy_to_image(self, array: np.ndarray) -> Image.Image:
        """
        Convert numpy array to Image object
        
        Args:
            array: numpy array with shape (height, width, channels)
        
        Returns:
            Image object
        """
        # Ensure array values are in 0-255 range
        array = np.clip(array, 0, 255).astype(np.uint8)
        return Image.fromarray(array)
    
    def add_alpha_channel(self, image: Image.Image) -> Image.Image:
        """
        Add transparency channel to the image
        
        Args:
            image: Original Image object
        
        Returns:
            Image object with transparency channel added
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
        Invert image colors
        
        Args:
            image: Original Image object
        
        Returns:
            Image object with inverted colors
        """
        try:
            if image.mode == 'RGBA':
                # 分离RGB和Alpha通道
                r, g, b, a = image.split()
                # 反转RGB通道
                r_inverted = ImageOps.invert(r)
                g_inverted = ImageOps.invert(g)
                b_inverted = ImageOps.invert(b)
                # 重新组合通道
                return Image.merge('RGBA', (r_inverted, g_inverted, b_inverted, a))
            else:
                # 直接反转其他模式
                return ImageOps.invert(image)
        except Exception as e:
            print(f"Failed to invert colors, error message: {str(e)}")
            return image
    
    def align_bottom(self, image: Image.Image, padding: int = 0) -> Image.Image:
        """
        Align character to the bottom center of the image
        
        Args:
            image: Original Image object
            padding: Bottom padding
            
        Returns:
            Aligned Image object
        """
        try:
            # Get alpha channel
            alpha = image.split()[3]
            
            # Find boundaries of non-transparent area
            bbox = alpha.getbbox()
            if not bbox:
                return image
            
            # Calculate offset
            offset_x = (image.width - (bbox[2] - bbox[0])) // 2
            offset_y = image.height - (bbox[3] - bbox[1]) - padding
            
            # Create new image
            new_image = Image.new('RGBA', image.size, (0, 0, 0, 0))
            
            # Paste image to new position
            new_image.paste(image.crop(bbox), (offset_x, offset_y))
            
            return new_image
        except Exception as e:
            print(f"Failed to align to bottom, error message: {str(e)}")
            return image
    
    def generate_shadow(self, image: Image.Image, shadow_color: tuple = (0, 0, 0, 100), shadow_size: int = 50) -> Image.Image:
        """
        Generate semi-transparent elliptical shadow
        
        Args:
            image: Original Image object
            shadow_color: Shadow color (RGBA)
            shadow_size: Shadow size
            
        Returns:
            Image object with shadow
        """
        try:
            # Get alpha channel
            alpha = image.split()[3]
            
            # Find boundaries of non-transparent area
            bbox = alpha.getbbox()
            if not bbox:
                return image
            
            # Create shadow image
            shadow = Image.new('RGBA', image.size, (0, 0, 0, 0))
            shadow_draw = ImageDraw.Draw(shadow)
            
            # Calculate shadow position and size
            shadow_x = (bbox[0] + bbox[2]) // 2 - shadow_size // 2
            shadow_y = bbox[3] - shadow_size // 4
            
            # Draw semi-transparent elliptical shadow
            shadow_draw.ellipse(
                [shadow_x, shadow_y, shadow_x + shadow_size, shadow_y + shadow_size // 2],
                fill=shadow_color
            )
            
            # Merge image and shadow
            result = Image.alpha_composite(shadow, image)
            
            return result
        except Exception as e:
            print(f"Failed to generate shadow, error message: {str(e)}")
            return image
    
    def resize_square(self, image: Image.Image, target_size: int = 512) -> Image.Image:
        """
        Square crop and resize
        
        Args:
            image: Original Image object
            target_size: Target size (width = height)
            
        Returns:
            Square resized Image object
        """
        try:
            # Calculate square crop area
            width, height = image.size
            square_size = min(width, height)
            
            # Center crop
            left = (width - square_size) // 2
            top = (height - square_size) // 2
            right = left + square_size
            bottom = top + square_size
            
            # Crop and resize
            cropped = image.crop((left, top, right, bottom))
            resized = cropped.resize((target_size, target_size), Image.LANCZOS)
            
            return resized
        except Exception as e:
            print(f"Square crop failed, error message: {str(e)}")
            return image
    
    def sharpen(self, image: Image.Image, factor: float = 1.5) -> Image.Image:
        """
        Edge enhancement
        
        Args:
            image: Original Image object
            factor: Sharpening factor
            
        Returns:
            Sharpened Image object
        """
        try:
            # Use PIL's sharpen filter
            sharpened = image.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))
            return sharpened
        except Exception as e:
            print(f"Edge enhancement failed, error message: {str(e)}")
            return image
    
    def make_seamless(self, image: Image.Image) -> Image.Image:
        """
        Make image seamless
        
        Args:
            image: Original Image object
            
        Returns:
            Seamless processed Image object
        """
        try:
            # Simple edge blending method: mirror flip edge pixels
            width, height = image.size
            
            # Create new image with extended borders
            extended = Image.new('RGBA', (width + 2, height + 2), (0, 0, 0, 0))
            extended.paste(image, (1, 1))
            
            # Mirror copy edges
            # Top edge
            extended.paste(image.crop((0, 0, width, 1)).transpose(Image.FLIP_TOP_BOTTOM), (1, 0))
            # Bottom edge
            extended.paste(image.crop((0, height - 1, width, height)).transpose(Image.FLIP_TOP_BOTTOM), (1, height + 1))
            # Left edge
            extended.paste(image.crop((0, 0, 1, height)).transpose(Image.FLIP_LEFT_RIGHT), (0, 1))
            # Right edge
            extended.paste(image.crop((width - 1, 0, width, height)).transpose(Image.FLIP_LEFT_RIGHT), (width + 1, 1))
            
            # Corners
            extended.paste(image.crop((0, 0, 1, 1)).transpose(Image.ROTATE_180), (0, 0))
            extended.paste(image.crop((width - 1, 0, width, 1)).transpose(Image.ROTATE_180), (width + 1, 0))
            extended.paste(image.crop((0, height - 1, 1, height)).transpose(Image.ROTATE_180), (0, height + 1))
            extended.paste(image.crop((width - 1, height - 1, width, height)).transpose(Image.ROTATE_180), (width + 1, height + 1))
            
            # Use Gaussian blur for edge blending
            blurred = extended.filter(ImageFilter.GaussianBlur(radius=1))
            
            # Crop back to original size
            result = blurred.crop((1, 1, width + 1, height + 1))
            
            return result
        except Exception as e:
            print(f"Failed to make seamless, error message: {str(e)}")
            return image
    
    def gen_lod(self, image: Image.Image, levels: int = 3) -> list[Image.Image]:
        """
        Generate LOD levels
        
        Args:
            image: Original Image object
            levels: Number of LOD levels to generate
            
        Returns:
            List of LOD levels from high to low
        """
        try:
            lods = [image]
            current_width, current_height = image.size
            
            for i in range(1, levels):
                # Reduce by half each time
                new_width = max(32, current_width // 2)
                new_height = max(32, current_height // 2)
                
                lod_image = image.resize((new_width, new_height), Image.LANCZOS)
                lods.append(lod_image)
                
                current_width, current_height = new_width, new_height
            
            return lods
        except Exception as e:
            print(f"Failed to generate LOD, error message: {str(e)}")
            return [image]
    
    def box_collision(self, image: Image.Image) -> tuple:
        """
        Generate collision box bounds
        
        Args:
            image: Original Image object
            
        Returns:
            Collision box bounds coordinates (left, top, right, bottom)
        """
        try:
            # Get alpha channel
            alpha = image.split()[3]
            
            # Find bounds of non-transparent area
            bbox = alpha.getbbox()
            if not bbox:
                return (0, 0, image.width, image.height)
            
            return bbox
        except Exception as e:
            print(f"Failed to generate collision box, error message: {str(e)}")
            return (0, 0, image.width, image.height)
    
    def adjust_brightness_contrast(self, image: Image.Image, brightness: float = 0.0, contrast: float = 0.0) -> Image.Image:
        """
        Adjust image brightness and contrast
        
        Args:
            image: Original Image object
            brightness: Brightness adjustment value (-100 to 100)
            contrast: Contrast adjustment value (-100 to 100)
            
        Returns:
            Adjusted Image object
        """
        try:
            # Convert brightness and contrast values to appropriate factors
            brightness_factor = 1.0 + (brightness / 100.0)
            contrast_factor = 1.0 + (contrast / 100.0)
            
            # Create image adjustment matrix
            # Brightness: new_pixel = pixel * 1.0 + brightness
            # Contrast: new_pixel = (pixel - 128) * contrast + 128
            # Combined: new_pixel = (pixel * brightness_factor - 128) * contrast_factor + 128
            
            # Convert to numpy array for processing
            img_array = np.array(image)
            
            # Split RGBA channels
            if img_array.shape[2] == 4:
                r, g, b, a = img_array[:, :, 0], img_array[:, :, 1], img_array[:, :, 2], img_array[:, :, 3]
            else:
                r, g, b = img_array[:, :, 0], img_array[:, :, 1], img_array[:, :, 2]
                a = None
            
            # Apply brightness and contrast adjustment
            for channel in [r, g, b]:
                # Apply adjustment formula
                channel[:] = ((channel * brightness_factor - 128) * contrast_factor + 128).clip(0, 255)
            
            # Recombine channels
            if a is not None:
                adjusted_array = np.stack((r, g, b, a), axis=2)
            else:
                adjusted_array = np.stack((r, g, b), axis=2)
            
            # Convert back to Image object
            return Image.fromarray(adjusted_array.astype(np.uint8))
            
        except Exception as e:
            print(f"Failed to adjust brightness and contrast, error message: {str(e)}")
            return image
    
    def batch_process(self, image_paths: list[str], process_func: callable, **kwargs) -> dict[str, Image.Image]:
        """
        Batch process multiple images in parallel
        
        Args:
            image_paths: List of image file paths
            process_func: Processing function to apply to each image
            **kwargs: Additional arguments for the processing function
            
        Returns:
            Dictionary mapping image paths to processed images
        """
        results = {}
        
        # Use ThreadPoolExecutor for parallel processing
        with concurrent.futures.ThreadPoolExecutor(max_workers=os.cpu_count()) as executor:
            # Submit all tasks
            future_to_path = {
                executor.submit(self._process_single_image, path, process_func, **kwargs): path
                for path in image_paths
            }
            
            # Collect results as they complete
            for future in concurrent.futures.as_completed(future_to_path):
                path = future_to_path[future]
                try:
                    result = future.result()
                    if result is not None:
                        results[path] = result
                except Exception as e:
                    print(f"Failed to process image {path}: {str(e)}")
        
        return results
    
    def _process_single_image(self, image_path: str, process_func: callable, **kwargs) -> Image.Image:
        """
        Process a single image with the specified function
        
        Args:
            image_path: Path to the image
            process_func: Processing function to apply
            **kwargs: Additional arguments for the processing function
            
        Returns:
            Processed image or None if failed
        """
        image = self.load_image(image_path)
        if image is None:
            return None
        
        try:
            result = process_func(image, **kwargs)
            return result
        except Exception as e:
            print(f"Error processing image {image_path}: {str(e)}")
            return None
