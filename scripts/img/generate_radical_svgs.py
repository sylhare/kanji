#!/usr/bin/env python3
"""
Generate portable 512x512 SVG images for all radicals in r214.yml.
"""

import yaml
import os
import math

def get_background_config(meaning, category):
    """Map radical meanings and categories to background shapes and colors."""
    
    meaning_lower = meaning.lower()
    
    # Water-related
    if any(word in meaning_lower for word in ['water', 'river', 'ice', 'rain', 'steam']):
        return 'waves', '#ADD8E6'  # Light blue
    
    # Mountain/earth-related
    if any(word in meaning_lower for word in ['mountain', 'hill', 'cliff', 'earth', 'stone']):
        return 'triangles', '#DEB887'  # Light brown
    
    # Fire-related
    if any(word in meaning_lower for word in ['fire', 'flame']):
        return 'flames', '#FFDAB9'  # Light orange
    
    # Plant/nature-related
    if any(word in meaning_lower for word in ['tree', 'wood', 'grass', 'bamboo', 'grain', 'rice', 'sprout']):
        return 'leaves', '#90EE90'  # Light green
    
    # Sky/weather-related
    if any(word in meaning_lower for word in ['sun', 'moon', 'wind', 'evening']):
        return 'circles', '#FFFFE0'  # Light yellow
    
    # Body parts
    if any(word in meaning_lower for word in ['hand', 'foot', 'eye', 'mouth', 'heart', 'body', 'head', 'ear', 'hair', 'face', 'nose']):
        return 'curves', '#FFE4E1'  # Light pink
    
    # Animals
    if any(word in meaning_lower for word in ['cow', 'dog', 'horse', 'bird', 'fish', 'sheep', 'pig', 'tiger', 'deer', 'frog', 'turtle']):
        return 'spots', '#F5F5DC'  # Beige
    
    # Tools/weapons
    if any(word in meaning_lower for word in ['knife', 'sword', 'axe', 'spear', 'bow', 'arrow', 'weapon']):
        return 'lines', '#D3D3D3'  # Light gray
    
    # Category-based fallbacks
    category_configs = {
        'Nature': ('waves', '#ADD8E6'),
        'Body': ('curves', '#FFE4E1'),
        'Animal': ('spots', '#F5F5DC'),
        'Weapon': ('lines', '#D3D3D3'),
        'Home': ('squares', '#FAF0E6'),
        'Food': ('circles', '#FFE4CD'),
        'Agriculture': ('leaves', '#90EE90'),
        'Clothing': ('curves', '#E6E6FA'),
        'Society': ('lines', '#F8F8FF'),
        'Color': ('gradients', '#FFFFFF'),
        'Number': ('dots', '#F0F8FF'),
        'Ceremony': ('curves', '#FFFAF0'),
        'Fishing': ('waves', '#AFEEEE'),
        'Other': ('random_lines', '#F5F5F5'),
        'Capability': ('lines', '#FAFAFA'),
    }
    
    return category_configs.get(category, ('random_lines', '#F5F5F5'))

def generate_background_svg(shape_type, color):
    """Generate SVG background pattern."""
    
    # Keep colors visible but not overwhelming
    if color.startswith('#'):
        # Convert hex to RGB and make it slightly paler
        hex_color = color[1:]
        r = int(hex_color[0:2], 16)
        g = int(hex_color[2:4], 16)
        b = int(hex_color[4:6], 16)
        # Make colors slightly paler but still visible
        r = min(255, r + 15)
        g = min(255, g + 15)  
        b = min(255, b + 15)
        pale_color = f"#{r:02x}{g:02x}{b:02x}"
    else:
        pale_color = color
    
    background_elements = []
    
    if shape_type == 'waves':
        # Generate wave paths with fills
        for i in range(0, 512, 60):
            path_data = f"M 0,{i + 40}"
            for x in range(20, 532, 20):
                y = i + 40 + 20 * math.sin(x * 0.015)
                path_data += f" L {x},{y}"
            path_data += f" L 512,{i + 60} L 0,{i + 60} Z"
            background_elements.append(f'<path d="{path_data}" fill="{pale_color}" opacity="0.3"/>')
    
    elif shape_type == 'triangles':
        # Mountain-like triangles with overlapping layers
        for i in range(4):
            x_offset = i * 150 - 50
            height_offset = 150 + i * 40
            points = f"{x_offset + 100},512 {x_offset + 200},{height_offset} {x_offset + 300},512"
            background_elements.append(f'<polygon points="{points}" fill="{pale_color}" opacity="0.4"/>')
    
    elif shape_type == 'circles':
        # Scattered circles with varying sizes
        for i in range(12):
            x = (i * 123) % 450 + 50
            y = (i * 87) % 450 + 50
            radius = 25 + (i % 4) * 15
            background_elements.append(f'<circle cx="{x}" cy="{y}" r="{radius}" fill="{pale_color}" opacity="0.3"/>')
    
    elif shape_type == 'lines':
        # Diagonal lines with thicker strokes
        for i in range(0, 512, 40):
            background_elements.append(f'<line x1="{i}" y1="0" x2="{i + 150}" y2="512" stroke="{pale_color}" stroke-width="4" opacity="0.4"/>')
        for i in range(0, 512, 40):
            background_elements.append(f'<line x1="0" y1="{i}" x2="512" y2="{i + 150}" stroke="{pale_color}" stroke-width="2" opacity="0.3"/>')
    
    elif shape_type == 'curves':
        # Curved filled areas
        for i in range(4):
            y_offset = i * 120
            path_data = f"M 0,{y_offset + 80}"
            for x in range(20, 532, 20):
                y = y_offset + 80 + 25 * math.sin(x * 0.008 + i)
                path_data += f" L {x},{y}"
            path_data += f" L 512,{y_offset + 120} L 0,{y_offset + 120} Z"
            background_elements.append(f'<path d="{path_data}" fill="{pale_color}" opacity="0.3"/>')
    
    elif shape_type == 'squares':
        # Grid pattern with rotation
        for i in range(0, 512, 80):
            for j in range(0, 512, 80):
                background_elements.append(f'<rect x="{i + 10}" y="{j + 10}" width="50" height="50" fill="{pale_color}" opacity="0.35" transform="rotate(15 {i+35} {j+35})"/>')
    
    elif shape_type == 'spots':
        # Scattered dots
        for i in range(20):
            x = (i * 73) % 512
            y = (i * 97) % 512
            radius = 8 + (i % 4) * 3
            background_elements.append(f'<circle cx="{x}" cy="{y}" r="{radius}" fill="{pale_color}" opacity="0.4"/>')
    
    elif shape_type == 'leaves':
        # Leaf-like shapes (ellipses)
        for i in range(10):
            x = (i * 97) % 512
            y = (i * 73) % 512
            background_elements.append(f'<ellipse cx="{x}" cy="{y}" rx="20" ry="15" fill="{pale_color}" opacity="0.4"/>')
    
    elif shape_type == 'flames':
        # Flame-like curves
        for i in range(6):
            x_base = i * 90 + 50
            path_data = f"M {x_base},512"
            for j in range(1, 10):
                x = x_base + 10 * math.sin(j * 0.5)
                y = 512 - j * 40
                path_data += f" L {x},{y}"
            background_elements.append(f'<path d="{path_data}" stroke="{pale_color}" stroke-width="4" fill="none" opacity="0.5"/>')
    
    elif shape_type == 'dots':
        # Regular dot pattern
        for i in range(0, 512, 80):
            for j in range(0, 512, 80):
                background_elements.append(f'<circle cx="{i}" cy="{j}" r="3" fill="{pale_color}" opacity="0.5"/>')
    
    else:  # random_lines or default
        # Random-ish lines
        for i in range(8):
            x1, y1 = (i * 70) % 512, (i * 90) % 512
            x2, y2 = (x1 + 150) % 512, (y1 + 100) % 512
            background_elements.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{pale_color}" stroke-width="2" opacity="0.4"/>')
    
    return '\n    '.join(background_elements)

def generate_radical_svg(radical_data, output_dir):
    """Generate a single portable radical SVG."""
    
    radical_char = radical_data['Radical']
    meaning = radical_data['Meaning']
    category = radical_data['Category']
    number = radical_data['Number']
    
    # Get background configuration
    shape_type, bg_color = get_background_config(meaning, category)
    background_svg = generate_background_svg(shape_type, bg_color)
    
    # Create portable SVG content (no @font-face declarations)
    svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .radical-text {{
        font-family: 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'Takao', 'IPAexGothic', 'IPAGothic', 'VL Gothic', 'Noto Sans CJK JP', serif;
        font-size: 200px;
        text-anchor: middle;
        dominant-baseline: middle;
        fill: #2c2c2c;
        font-weight: normal;
      }}
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="512" height="512" fill="white"/>
  
  <!-- Background Pattern -->
  <g opacity="1.0">
    {background_svg}
  </g>
  
  <!-- Radical Character -->
  <text x="256" y="256" class="radical-text">{radical_char}</text>
</svg>'''
    
    # Save the SVG
    filename = f"radical_{int(number):03d}.svg"
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    
    print(f"Generated: {filename} ({meaning})")
    return filepath

def main():
    """Generate all portable radical SVGs."""
    
    # Determine paths relative to project root
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.join(script_dir, '..', '..')  # Go up from scripts/img/ to project root
    data_file = os.path.join(project_root, '_data', 'r214.yml')
    output_dir = os.path.join(project_root, 'assets', 'img', 'radicals_svg')
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Load the YAML file
    try:
        with open(data_file, 'r', encoding='utf-8') as file:
            radicals_data = yaml.safe_load(file)
    except FileNotFoundError:
        print(f"Error: {data_file} file not found!")
        return
    except Exception as e:
        print(f"Error loading YAML file: {e}")
        return
    
    print(f"Portable Radical SVG Generator")
    print("=" * 50)
    print(f"Data source: {os.path.relpath(data_file)}")
    print(f"Output directory: {os.path.relpath(output_dir)}")
    print(f"Generating {len(radicals_data)} radical SVG images...")
    print("-" * 50)
    
    generated_count = 0
    
    # Generate SVGs for all radicals
    for radical_data in radicals_data:
        try:
            generate_radical_svg(radical_data, output_dir)
            generated_count += 1
        except Exception as e:
            print(f"❌ Error generating SVG for radical {radical_data.get('Number', '?')}: {e}")
    
    print("-" * 50)
    print(f"✅ Generation complete! Generated {generated_count} portable SVG images.")
    print(f"📁 Images saved in: {os.path.abspath(output_dir)}")
    print("\n🚀 These SVGs are fully portable and can be moved anywhere!")

if __name__ == "__main__":
    main()
