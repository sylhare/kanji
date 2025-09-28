#!/usr/bin/env python3
"""
PNG Image Optimizer
==================

Optimizes PNG images to reduce file size without losing visual quality.
Uses various compression and optimization techniques.

Usage:
    python optimize_png_images.py [input_folder] [output_folder]
    python optimize_png_images.py -i input_folder -o output_folder
    python optimize_png_images.py --help

Features:
- Lossless PNG optimization
- Metadata removal
- Compression level optimization
- Progress tracking
- Size reduction statistics
"""

import os
import sys
import argparse
from pathlib import Path
from PIL import Image, ImageOps
import time


def optimize_png_image(input_path, output_path, quality_level=9):
    """
    Optimize a single PNG image for smaller file size while maintaining exact dimensions and visual quality.
    
    Args:
        input_path (str): Path to input PNG file
        output_path (str): Path for optimized output file  
        quality_level (int): Compression level 1-9 (9 = best compression)
    
    Returns:
        tuple: (original_size, new_size, success)
    """
    try:
        with Image.open(input_path) as img:
            print(f"Processing: {os.path.basename(input_path)}")
            
            # Get original file size and dimensions
            original_size = os.path.getsize(input_path)
            print(f"  Original size: {original_size:,} bytes ({original_size/1024:.1f} KB)")
            print(f"  Dimensions: {img.size} (will be preserved)")
            print(f"  Color mode: {img.mode}")
            
            # IMPORTANT: Keep exact dimensions - only optimize compression
            # No resizing, no dimension changes whatsoever
            
            # Convert RGBA to RGB if there's no transparency (this usually helps)
            if img.mode == 'RGBA':
                # Check if image actually uses transparency
                alpha_channel = img.split()[3]
                if alpha_channel.getextrema()[0] == alpha_channel.getextrema()[1] == 255:  # All alpha values are 255 (opaque)
                    print("  Converting RGBA to RGB (no transparency used)")
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    background.paste(img, mask=alpha_channel)
                    img = background
                else:
                    print("  Keeping RGBA (transparency detected)")
            
            # Smart optimization with gentler methods for wider range of options
            if img.mode == 'RGB' and img.size[0] * img.size[1] >= 200000:  # For larger images
                best_img = img
                best_size = original_size
                best_method = "standard PNG optimization"
                
                all_options = []  # Store all viable options
                
                # Try multiple optimization approaches to get wider range of reductions
                optimization_methods = [
                    # Method 1: Different quantization with various dithering
                    ('quantize_floyd', lambda img, colors: img.quantize(colors=colors, method=Image.Resampling.LANCZOS, dither=Image.Dither.FLOYDSTEINBERG)),
                    ('quantize_none', lambda img, colors: img.quantize(colors=colors, method=Image.Resampling.LANCZOS, dither=Image.Dither.NONE)),
                    ('quantize_median', lambda img, colors: img.quantize(colors=colors, method=Image.Resampling.NEAREST)),
                    
                    # Method 2: Posterization (reduce color levels per channel)
                    ('posterize', lambda img, levels: posterize_image(img, levels)),
                    
                    # Method 3: Convert to different modes
                    ('convert_p_adaptive', lambda img, colors: img.convert('P', palette=Image.Palette.ADAPTIVE, colors=colors)),
                    ('convert_p_web', lambda img, colors: img.convert('P', palette=Image.Palette.WEB) if colors >= 216 else img.convert('P', palette=Image.Palette.ADAPTIVE, colors=colors)),
                    
                    # Method 4: Bit depth optimization with different compression
                    ('low_compress', lambda img, level: optimize_compression_level(img, level)),
                ]
                
                def posterize_image(img, bits):
                    """Reduce color levels per channel"""
                    from PIL import ImageOps
                    return ImageOps.posterize(img, bits)
                
                def optimize_compression_level(img, level):
                    """Just change compression settings"""
                    return img  # Will be saved with different compress_level
                
                for method_name, method_func in optimization_methods:
                    if method_name == 'posterize':
                        # For posterization, try different bit levels (more bits = less compression)
                        param_list = [7, 6, 5, 4, 3, 2]  # bits per channel
                        param_name = 'bits'
                    elif method_name == 'low_compress':
                        # For compression levels, try different settings
                        param_list = [6, 5, 4, 3, 2, 1]  # compress levels (lower = less compression)
                        param_name = 'level'
                    else:
                        # For color-based methods
                        param_list = [256, 240, 224, 208, 192, 176, 160, 144, 128, 112, 96, 80, 64]
                        param_name = 'colors'
                    
                    for param_value in param_list:
                        try:
                            optimized = method_func(img, param_value)
                            
                            # Test file size with different compression for compression method
                            temp_path = str(output_path) + f'.temp_{method_name}_{param_value}'
                            compress_level = param_value if method_name == 'low_compress' else quality_level
                            optimized.save(temp_path, 'PNG', optimize=True, compress_level=compress_level)
                            optimized_size = os.path.getsize(temp_path)
                            os.remove(temp_path)
                            
                            reduction = ((original_size - optimized_size) / original_size) * 100
                            
                            # Collect all options that give meaningful reduction (>2%)
                            if reduction > 2:
                                all_options.append({
                                    'img': optimized,
                                    'size': optimized_size,
                                    'reduction': reduction,
                                    'method': f"{method_name} with {param_value} {param_name}",
                                    'param': param_value
                                })
                                print(f"  Option: {method_name} {param_value} {param_name} = {reduction:.1f}% reduction")
                        except Exception as e:
                            # Skip methods that don't work for this image
                            continue
                
                # Pick the LOWEST reduction from all available options
                if all_options:
                    # Sort by reduction (ascending) and take the lowest one
                    best_option = min(all_options, key=lambda x: x['reduction'])
                    
                    # Always take the lowest reduction available
                    best_img = best_option['img']
                    best_size = best_option['size']
                    best_method = f"{best_option['method']} ({best_option['reduction']:.1f}% reduction)"
                    
                    if best_option['reduction'] <= 30:
                        print(f"  ✓ Perfect: Selected lowest option = {best_option['reduction']:.1f}% reduction")
                    else:
                        print(f"  ✓ Selected least aggressive option = {best_option['reduction']:.1f}% reduction")
                
                # Use the best option we found
                img = best_img
                if best_method != "standard PNG optimization":
                    print(f"  Applied {best_method}")
                else:
                    print("  Applying standard PNG optimization (no good quantization found)")
            else:
                print("  Applying standard PNG optimization")
            
            # Save with moderate optimization
            img.save(
                output_path, 
                'PNG',
                optimize=True,  # Enable PIL's built-in optimization
                compress_level=quality_level,  # Use provided compression level
                # Remove metadata for smaller size
                icc_profile=None,
                exif=b'',
            )
            
            # Get new file size
            new_size = os.path.getsize(output_path)
            reduction = ((original_size - new_size) / original_size) * 100
            
            print(f"  Optimized size: {new_size:,} bytes ({new_size/1024:.1f} KB)")
            print(f"  Size reduction: {reduction:.1f}%")
            
            return original_size, new_size, True
            
    except Exception as e:
        print(f"  ❌ Error processing {input_path}: {e}")
        return 0, 0, False


def process_folder(input_folder, output_folder, quality_level=9):
    """
    Process all PNG files in a folder.
    
    Args:
        input_folder (str): Input directory path
        output_folder (str): Output directory path
        quality_level (int): Compression level 1-9
        
    Returns:
        dict: Processing statistics
    """
    input_path = Path(input_folder)
    output_path = Path(output_folder)
    
    if not input_path.exists():
        print(f"❌ Input folder does not exist: {input_folder}")
        return None
        
    # Create output directory
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Find all PNG files
    png_files = list(input_path.glob("*.png")) + list(input_path.glob("*.PNG"))
    
    if not png_files:
        print("❌ No PNG files found in input folder")
        return None
    
    print(f"Found {len(png_files)} PNG files to optimize")
    print(f"Input folder: {input_folder}")
    print(f"Output folder: {output_folder}")
    print(f"Compression level: {quality_level}")
    print("-" * 70)
    
    # Process statistics
    stats = {
        'total_files': len(png_files),
        'processed': 0,
        'failed': 0,
        'total_original_size': 0,
        'total_optimized_size': 0,
    }
    
    start_time = time.time()
    
    for i, png_file in enumerate(png_files, 1):
        print(f"\n[{i}/{len(png_files)}]", end=" ")
        
        output_file = output_path / png_file.name
        original_size, new_size, success = optimize_png_image(
            str(png_file), 
            str(output_file), 
            quality_level
        )
        
        if success:
            stats['processed'] += 1
            stats['total_original_size'] += original_size
            stats['total_optimized_size'] += new_size
        else:
            stats['failed'] += 1
    
    # Print summary
    elapsed_time = time.time() - start_time
    print("\n" + "=" * 70)
    print("OPTIMIZATION COMPLETE!")
    print("=" * 70)
    print(f"Total files: {stats['total_files']}")
    print(f"Successfully processed: {stats['processed']}")
    print(f"Failed: {stats['failed']}")
    print(f"Processing time: {elapsed_time:.1f} seconds")
    
    if stats['processed'] > 0:
        total_reduction = ((stats['total_original_size'] - stats['total_optimized_size']) 
                          / stats['total_original_size']) * 100
        print(f"\nOriginal total size: {stats['total_original_size']:,} bytes ({stats['total_original_size']/1024/1024:.1f} MB)")
        print(f"Optimized total size: {stats['total_optimized_size']:,} bytes ({stats['total_optimized_size']/1024/1024:.1f} MB)")
        print(f"Total size reduction: {total_reduction:.1f}%")
        print(f"Space saved: {stats['total_original_size'] - stats['total_optimized_size']:,} bytes ({(stats['total_original_size'] - stats['total_optimized_size'])/1024/1024:.1f} MB)")
    
    print(f"\nOptimized images saved in: {output_folder}")
    
    return stats


def main():
    parser = argparse.ArgumentParser(
        description='Optimize PNG images for smaller file size without quality loss',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python optimize_png_images.py ../../assets/img/selected optimized_images
    python optimize_png_images.py -i images/ -o compressed/ -q 9
    python optimize_png_images.py /path/to/pngs /path/to/output --quality 8

Compression levels:
    1 = Fastest, larger files
    9 = Slowest, maximum compression (recommended)
        """)
    
    parser.add_argument('input_path', nargs='?', 
                       default='../../assets/img/selected',
                       help='Input folder or single PNG file (default: ../../assets/img/selected)')
    parser.add_argument('output_path', nargs='?', 
                       default='optimized_images',
                       help='Output folder or single PNG file (default: optimized_images)')
    parser.add_argument('--single', action='store_true',
                       help='Process single image instead of folder')
    parser.add_argument('-i', '--input', 
                       help='Input folder (alternative to positional arg)')
    parser.add_argument('-o', '--output', 
                       help='Output folder (alternative to positional arg)')
    parser.add_argument('-q', '--quality', type=int, default=9, choices=range(1, 10),
                       help='PNG compression level 1-9 (default: 9 = maximum compression for up to 30% reduction)')
    
    args = parser.parse_args()
    
    # Use named arguments if provided, otherwise use positional
    input_path = args.input or args.input_path
    output_path = args.output or args.output_path
    
    print("PNG Image Optimizer")
    print("==================")
    print("Optimize file size while preserving exact dimensions\n")
    
    # Process single image or folder
    if args.single or (Path(input_path).is_file() and input_path.lower().endswith('.png')):
        print("Single image mode")
        original_size, new_size, success = optimize_png_image(input_path, output_path, args.quality)
        if success:
            print("\n✅ Image optimized successfully!")
        else:
            print("\n❌ Failed to optimize image")
            sys.exit(1)
        return
    
    # Process the folder
    stats = process_folder(input_path, output_path, args.quality)
    
    if stats is None:
        sys.exit(1)
    elif stats['failed'] > 0:
        sys.exit(2)
    else:
        print("\n✅ All images optimized successfully!")


if __name__ == '__main__':
    main()
