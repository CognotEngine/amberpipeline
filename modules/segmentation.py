#!/usr/bin/env python3
"""
AmberPipeline AI - Semantic Segmentation Module
Uses SAM (Segment Anything Model) to implement auto-segmentation functionality, separating background from target objects
"""

import os
import numpy as np
from PIL import Image
import torch
import cv2
from segment_anything import SamPredictor, SamAutomaticMaskGenerator, sam_model_registry

class SAMSegmenter:
    """
    SAM Semantic Segmentation Class
    """
    
    def __init__(self, config):
        """
        Initialize SAM Segmenter
        
        Args:
            config: Configuration object
        """
        self.config = config
        self.sam = None
        self.predictor = None
        self.mask_generator = None
        
        # Lazy load model, initialize only when needed
        # Removed direct call to _init_sam_model()
    
    def _init_sam_model(self):
        """
        Initialize SAM Model
        """
        try:
            # Check if model file exists
            if not os.path.exists(self.config.sam_model_path):
                print(f"SAM model file not found: {self.config.sam_model_path}")
                print("Please download SAM model from https://github.com/facebookresearch/segment-anything")
                return
            
            # Determine model type
            model_type = "vit_h"  # Default to vit_h model
            if "vit_b" in self.config.sam_model_path.lower():
                model_type = "vit_b"
            elif "vit_l" in self.config.sam_model_path.lower():
                model_type = "vit_l"
            
            # Load model
            print(f"Loading SAM model: {self.config.sam_model_path}")
            self.sam = sam_model_registry[model_type](checkpoint=self.config.sam_model_path)
            self.sam.to(device=self.config.sam_device)
            
            # Create predictor and mask generator
            self.predictor = SamPredictor(self.sam)
            self.mask_generator = SamAutomaticMaskGenerator(
                self.sam,
                points_per_side=32,
                pred_iou_thresh=0.9,
                stability_score_thresh=0.92,
                crop_n_layers=1,
                crop_n_points_downscale_factor=2,
                min_mask_region_area=100
            )
            
            print("SAM model initialized successfully")
            
        except Exception as e:
            print(f"Failed to initialize SAM model, error: {str(e)}")
            self.sam = None
            self.predictor = None
            self.mask_generator = None
    
    def segment(self, image_path: str) -> Image.Image:
        """
        Perform semantic segmentation (object extraction) on image
        
        Args:
            image_path: Image file path
        
        Returns:
            Segmented Image object, or None if processing fails
        """
        # Lazy load model, initialize only when needed
        if self.sam is None or self.predictor is None:
            self._init_sam_model()
            if self.sam is None or self.predictor is None:
                print("SAM model not initialized, cannot perform segmentation")
                return None
        
        try:
            # Get target point clicked by user
            target_point = self.get_target_point(image_path)
            if target_point is None:
                print("User did not click to select target point, cannot perform segmentation")
                return None
            
            # Perform segmentation with point prompt
            points = [target_point]
            point_labels = [1]  # 1 indicates foreground
            
            return self.segment_with_points(image_path, points, point_labels)
            
        except Exception as e:
            print(f"Failed to segment image: {image_path}, error: {str(e)}")
            return None
    
    def get_target_point(self, image_path: str) -> tuple:
        """
        Get target point coordinates clicked by user
        
        Args:
            image_path: Image file path
        
        Returns:
            (x, y): Clicked coordinates, or None if user didn't click
        """
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            print(f"Failed to load image: {image_path}")
            return None
        
        # Save original size
        original_height, original_width = image.shape[:2]
        
        # Auto resize image, maximum width 1024, height scaled proportionally
        max_width = 1024
        if original_width > max_width:
            scale = max_width / original_width
            new_height = int(original_height * scale)
            image = cv2.resize(image, (max_width, new_height))
            resized = True
        else:
            resized = False
        
        # Create window
        window_name = "AmberPipeline - Click to Extract BOSS"
        cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
        cv2.imshow(window_name, image)
        
        # Store click coordinates
        click_point = None
        
        def mouse_callback(event, x, y, flags, param):
            nonlocal click_point
            if event == cv2.EVENT_LBUTTONDOWN:
                click_point = (x, y)
                cv2.destroyAllWindows()
        
        # Set mouse callback
        cv2.setMouseCallback(window_name, mouse_callback)
        
        # Wait for user click
        cv2.waitKey(0)
        
        # Handle coordinate mapping
        if click_point is not None:
            if resized:
                # Map back to original size
                original_x = int(click_point[0] / scale)
                original_y = int(click_point[1] / scale)
                return (original_x, original_y)
            else:
                return click_point
        
        return None
    
    def segment_with_points(self, image_path: str, points: list, point_labels: list) -> Image.Image:
        """
        Perform semantic segmentation with point prompts
        
        Args:
            image_path: Image file path
            points: List of point coordinates [(x1, y1), (x2, y2), ...]
            point_labels: List of point labels [0, 1, ...] 0 for background, 1 for foreground
        
        Returns:
            Segmented Image object, or None if processing fails
        """
        # Lazy load model, initialize only when needed
        if self.sam is None or self.predictor is None:
            self._init_sam_model()
            if self.sam is None or self.predictor is None:
                print("SAM model not initialized, cannot perform segmentation")
                return None
        
        try:
            # Load image
            image = Image.open(image_path)
            if image.mode == 'RGBA':
                image = image.convert('RGB')
            elif image.mode != 'RGB':
                image = image.convert('RGB')
            
            image_np = np.array(image)
            
            # Set image
            self.predictor.set_image(image_np)
            
            # Convert point format
            input_points = np.array(points)
            input_labels = np.array(point_labels)
            
            # Generate masks
            masks, scores, logits = self.predictor.predict(
                point_coords=input_points,
                point_labels=input_labels,
                multimask_output=True
            )
            
            # Select best mask
            best_idx = np.argmax(scores)
            mask = masks[best_idx]
            
            # Generate segmentation result
            rgba_image = np.zeros((image_np.shape[0], image_np.shape[1], 4), dtype=np.uint8)
            rgba_image[:, :, :3] = image_np
            rgba_image[:, :, 3] = mask.astype(np.uint8) * 255
            
            result_image = Image.fromarray(rgba_image)
            
            return result_image
            
        except Exception as e:
            print(f"Failed to segment image with point prompts: {image_path}, error: {str(e)}")
            return None
