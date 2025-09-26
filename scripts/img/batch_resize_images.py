#!/usr/bin/env python3
"""
Batch resize images to 512x512 while maintaining aspect ratio.
Can process single folders or multiple folders/files.
"""

import os
import sys
import argparse
from PIL import Image
import glob

def resize_with_center_crop(input_path, output_path, target_size=512):
    """
    Crop the image to a square (center crop) and then resize to target_size x target_size.
    No padding is added - the image fills the entire target size.
    """
    
    try:
        # Open the original image
        with Image.open(input_path) as img:
            print(f"Processing: {os.path.basename(input_path)}")
            print(f"  Original size: {img.size}")
            
            original_width, original_height = img.size
            
            # Determine the size of the square crop (smallest dimension)
            crop_size = min(original_width, original_height)
            
            # Calculate crop coordinates for center crop
            left = (original_width - crop_size) // 2
            top = (original_height - crop_size) // 2
            right = left + crop_size
            bottom = top + crop_size
            
            print(f"  Cropping to: {crop_size}x{crop_size} (center crop)")
            
            # Crop to square
            cropped_img = img.crop((left, top, right, bottom))
            
            # Resize the square image to target size
            final_img = cropped_img.resize((target_size, target_size), Image.Resampling.LANCZOS)
            
            print(f"  Final size: {target_size}x{target_size}")
            
            # Save the final image
            final_img.save(output_path, 'PNG', optimize=True)
            print(f"  ✓ Saved: {output_path}")
            return True
            
    except Exception as e:
        print(f"  ❌ Error processing {input_path}: {e}")
        return False

def process_folder(folder_path, output_dir, target_size=512):
    """Process all image files in a folder."""
    
    # Supported image extensions
    extensions = ['*.png', '*.jpg', '*.jpeg', '*.bmp', '*.gif', '*.tiff']
    
    processed_count = 0
    
    # Create subfolder based on input folder name
    folder_name = os.path.basename(folder_path)
    subfolder_path = os.path.join(output_dir, folder_name)
    os.makedirs(subfolder_path, exist_ok=True)
    
    for ext in extensions:
        pattern = os.path.join(folder_path, ext)
        files = glob.glob(pattern, recursive=False)
        
        for file_path in files:
            # Keep original filename (without path, but with extension as .png)
            base_name = os.path.splitext(os.path.basename(file_path))[0]
            output_filename = f"{base_name}.png"
            output_path = os.path.join(subfolder_path, output_filename)
            
            if resize_with_center_crop(file_path, output_path, target_size):
                processed_count += 1
    
    return processed_count

def main():
    parser = argparse.ArgumentParser(description='Resize images to 512x512 while maintaining aspect ratio')
    parser.add_argument('input_path', nargs='?', 
                       default='../../_data/assets/img/radical/selected/',
                       help='Input folder or file path (default: selected-g folder)')
    parser.add_argument('-o', '--output', default='resized_images',
                       help='Output directory (default: resized_images in scripts folder)')
    parser.add_argument('-s', '--size', type=int, default=512,
                       help='Target size (default: 512)')
    # Removed bg-color since we're doing center crop instead of padding
    
    args = parser.parse_args()
    
    # Create output directory
    os.makedirs(args.output, exist_ok=True)
    
    print(f"Batch Image Resizer - {args.size}x{args.size} with Center Crop")
    print("=" * 70)
    print(f"Input: {args.input_path}")
    print(f"Output: {args.output}")
    print(f"Target size: {args.size}x{args.size}")
    print(f"Method: Center crop to square, then resize")
    print("-" * 70)
    
    total_processed = 0
    
    if os.path.isfile(args.input_path):
        # Process single file
        base_name = os.path.splitext(os.path.basename(args.input_path))[0]
        output_path = os.path.join(args.output, f"{base_name}.png")
        if resize_with_center_crop(args.input_path, output_path, args.size):
            total_processed = 1
    
    elif os.path.isdir(args.input_path):
        # Process folder
        total_processed = process_folder(args.input_path, args.output, args.size)
    
    else:
        print(f"❌ Path not found: {args.input_path}")
        sys.exit(1)
    
    print("-" * 70)
    print(f"Processing complete! {total_processed} images processed.")
    print(f"Results saved in: {os.path.abspath(args.output)}")

if __name__ == "__main__":
    main()
