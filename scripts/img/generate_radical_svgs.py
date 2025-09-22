#!/usr/bin/env python3
"""
Generate portable 512x512 SVG images for all radicals in r214.yml.
"""

import yaml
import os
import math
import random

def get_background_config(meaning, category):
    """Map radical meanings and categories to background shapes and specific colors."""
    
    meaning_lower = meaning.lower()
    
    # Meaning-based mappings (these take priority)
    if any(word in meaning_lower for word in ['water', 'river', 'ice', 'rain', 'steam']):
        return 'waves', '#4169E1'  # Royal blue
    
    if any(word in meaning_lower for word in ['mountain', 'hill', 'cliff', 'earth', 'stone']):
        return 'triangles', '#8B4513'  # Saddle brown
    
    if any(word in meaning_lower for word in ['fire', 'flame']):
        return 'flames', '#FF4500'  # Orange red
    
    if any(word in meaning_lower for word in ['tree', 'wood', 'grass', 'bamboo', 'grain', 'rice', 'sprout']):
        return 'leaves', '#228B22'  # Forest green
    
    if any(word in meaning_lower for word in ['sun', 'moon', 'wind', 'evening']):
        return 'circles', '#FFD700'  # Gold
    
    if any(word in meaning_lower for word in ['hand', 'foot', 'eye', 'mouth', 'heart', 'body', 'head', 'ear', 'hair', 'face', 'nose']):
        return 'curves', '#DC143C'  # Crimson
    
    if any(word in meaning_lower for word in ['cow', 'dog', 'horse', 'bird', 'fish', 'sheep', 'pig', 'tiger', 'deer', 'frog', 'turtle']):
        return 'spots', '#CD853F'  # Peru brown
    
    if any(word in meaning_lower for word in ['knife', 'sword', 'axe', 'spear', 'bow', 'arrow', 'weapon']):
        return 'lines', '#708090'  # Slate gray
    
    # Category-based mappings with unique colors for each category
    category_configs = {
        'Nature': ('waves', '#4169E1'),        # Royal blue
        'Body': ('curves', '#DC143C'),         # Crimson  
        'Animal': ('spots', '#CD853F'),        # Peru brown
        'Weapon': ('lines', '#708090'),        # Slate gray
        'Home': ('squares', '#DDA0DD'),        # Plum
        'Food': ('circles', '#FFD700'),        # Gold
        'Agriculture': ('leaves', '#228B22'),   # Forest green
        'Clothing': ('curves', '#9370DB'),      # Medium purple
        'Society': ('lines', '#4682B4'),        # Steel blue
        'Color': ('spots', '#FF69B4'),          # Hot pink
        'Number': ('dots', '#20B2AA'),          # Light sea green
        'Ceremony': ('curves', '#B8860B'),      # Dark goldenrod
        'Fishing': ('waves', '#008B8B'),        # Dark cyan
        'Other': ('random_lines', '#696969'),   # Dim gray
        'Capability': ('lines', '#2F4F4F'),     # Dark slate gray
    }
    
    return category_configs.get(category, ('random_lines', '#696969'))

def generate_background_svg(shape_type, color):
    """Generate SVG background pattern with vibrant, colorful patterns."""
    
    # Use the specified color directly for patterns - much simpler and more predictable!
    pattern_color = color
    
    background_elements = []
    
    if shape_type == 'waves':
        # Generate more wavy patterns with random phases for variation
        random.seed(hash(pattern_color) % 1000)  # Consistent but varied seed
        for i in range(0, 512, 50):  # Slightly closer waves
            phase_offset = random.uniform(0, math.pi * 2)  # Random phase for each wave
            amplitude = random.uniform(15, 35)  # Random amplitude for more variation
            path_data = f"M 0,{i + 40}"
            for x in range(10, 532, 15):  # Finer resolution for smoother waves
                y = i + 40 + amplitude * math.sin(x * 0.02 + phase_offset)  # Higher frequency, more wavy
                path_data += f" L {x},{y}"
            path_data += f" L 512,{i + 50} L 0,{i + 50} Z"
            background_elements.append(f'<path d="{path_data}" fill="{pattern_color}" opacity="0.7"/>')
    
    elif shape_type == 'triangles':
        # Plain triangles with different shades only
        shades = [0.7, 0.6, 0.8, 0.5]  # More vibrant opacity levels for shading
        for i in range(4):
            x_offset = i * 150 - 50
            height_offset = 150 + i * 40
            points = f"{x_offset + 100},512 {x_offset + 200},{height_offset} {x_offset + 300},512"
            opacity = shades[i % len(shades)]
            background_elements.append(f'<polygon points="{points}" fill="{pattern_color}" opacity="{opacity}"/>')
    
    elif shape_type == 'circles':
        # Scattered circles with variations: filled, outline, and mixed
        for i in range(12):
            x = (i * 123) % 450 + 50
            y = (i * 87) % 450 + 50
            radius = 25 + (i % 4) * 15
            
            # Vary the style for each circle
            style_choice = i % 3
            
            if style_choice == 0:
                # Filled circles
                background_elements.append(f'<circle cx="{x}" cy="{y}" r="{radius}" fill="{pattern_color}" opacity="0.6"/>')
            elif style_choice == 1:
                # Outline only
                background_elements.append(f'<circle cx="{x}" cy="{y}" r="{radius}" fill="none" stroke="{pattern_color}" stroke-width="3" opacity="0.7"/>')
            else:
                # Mixed: outline with smaller filled inner circle
                background_elements.append(f'<circle cx="{x}" cy="{y}" r="{radius}" fill="none" stroke="{pattern_color}" stroke-width="2" opacity="0.6"/>')
                inner_radius = radius * 0.5
                background_elements.append(f'<circle cx="{x}" cy="{y}" r="{inner_radius}" fill="{pattern_color}" opacity="0.5"/>')
    
    elif shape_type == 'lines':
        # Diagonal lines with thicker strokes (simple crosshatch pattern)
        for i in range(0, 512, 40):
            background_elements.append(f'<line x1="{i}" y1="0" x2="{i + 150}" y2="512" stroke="{pattern_color}" stroke-width="4" opacity="0.6"/>')
        for i in range(0, 512, 40):
            background_elements.append(f'<line x1="0" y1="{i}" x2="512" y2="{i + 150}" stroke="{pattern_color}" stroke-width="2" opacity="0.5"/>')
    
    elif shape_type == 'curves':
        # Curved filled areas
        for i in range(4):
            y_offset = i * 120
            path_data = f"M 0,{y_offset + 80}"
            for x in range(20, 532, 20):
                y = y_offset + 80 + 25 * math.sin(x * 0.008 + i)
                path_data += f" L {x},{y}"
            path_data += f" L 512,{y_offset + 120} L 0,{y_offset + 120} Z"
            background_elements.append(f'<path d="{path_data}" fill="{pattern_color}" opacity="0.6"/>')
    
    elif shape_type == 'squares':
        # Grid pattern with variations: filled, outline, and mixed
        for i in range(0, 512, 80):
            for j in range(0, 512, 80):
                x = i + 10
                y = j + 10
                size = 50
                center_x = x + size/2
                center_y = y + size/2
                rotation = 15
                
                # Vary the style based on position
                style_choice = (i//80 + j//80) % 3
                
                if style_choice == 0:
                    # Filled rectangles
                    background_elements.append(f'<rect x="{x}" y="{y}" width="{size}" height="{size}" fill="{pattern_color}" opacity="0.6" transform="rotate({rotation} {center_x} {center_y})"/>')
                elif style_choice == 1:
                    # Outline only
                    background_elements.append(f'<rect x="{x}" y="{y}" width="{size}" height="{size}" fill="none" stroke="{pattern_color}" stroke-width="2" opacity="0.7" transform="rotate({rotation} {center_x} {center_y})"/>')
                else:
                    # Mixed: smaller filled inside larger outline
                    background_elements.append(f'<rect x="{x}" y="{y}" width="{size}" height="{size}" fill="none" stroke="{pattern_color}" stroke-width="2" opacity="0.6" transform="rotate({rotation} {center_x} {center_y})"/>')
                    inner_size = size * 0.6
                    inner_offset = (size - inner_size) / 2
                    background_elements.append(f'<rect x="{x + inner_offset}" y="{y + inner_offset}" width="{inner_size}" height="{inner_size}" fill="{pattern_color}" opacity="0.5" transform="rotate({rotation} {center_x} {center_y})"/>')
    
    elif shape_type == 'spots':
        # Scattered dots
        for i in range(20):
            x = (i * 73) % 512
            y = (i * 97) % 512
            radius = 8 + (i % 4) * 3
            background_elements.append(f'<circle cx="{x}" cy="{y}" r="{radius}" fill="{pattern_color}" opacity="0.6"/>')
    
    elif shape_type == 'leaves':
        # Plain leaf shapes with different shades only (for green/agriculture)
        shades = [0.6, 0.5, 0.7, 0.55, 0.65, 0.45, 0.6, 0.55, 0.7, 0.5]  # More vibrant opacity levels
        for i in range(10):
            x = (i * 97) % 512
            y = (i * 73) % 512
            rx = 20
            ry = 15
            rotation = i * 36  # Rotate leaves for natural look
            opacity = shades[i % len(shades)]
            
            # Always filled leaves with different shades
            background_elements.append(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{pattern_color}" opacity="{opacity}" transform="rotate({rotation} {x} {y})"/>')
    
    elif shape_type == 'flames':
        # Flame-like curves
        for i in range(6):
            x_base = i * 90 + 50
            path_data = f"M {x_base},512"
            for j in range(1, 10):
                x = x_base + 10 * math.sin(j * 0.5)
                y = 512 - j * 40
                path_data += f" L {x},{y}"
            background_elements.append(f'<path d="{path_data}" stroke="{pattern_color}" stroke-width="4" fill="none" opacity="0.7"/>')
    
    elif shape_type == 'dots':
        # Regular dot pattern
        for i in range(0, 512, 80):
            for j in range(0, 512, 80):
                background_elements.append(f'<circle cx="{i}" cy="{j}" r="3" fill="{pattern_color}" opacity="0.7"/>')
    
    else:  # random_lines or default
        # Random-ish lines
        for i in range(8):
            x1, y1 = (i * 70) % 512, (i * 90) % 512
            x2, y2 = (x1 + 150) % 512, (y1 + 100) % 512
            background_elements.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{pattern_color}" stroke-width="2" opacity="0.6"/>')
    
    return '\n    '.join(background_elements)

def get_text_color(bg_color):
    """Get a darker text color for good readability on very white backgrounds."""
    
    # Since backgrounds are now 99% white, use moderately dark text
    # Convert hex to RGB
    if bg_color.startswith('#'):
        hex_color = bg_color[1:]
        r = int(hex_color[0:2], 16)
        g = int(hex_color[2:4], 16)
        b = int(hex_color[4:6], 16)
        
        # Use darker colors (45% of original) to show more pattern color while staying readable
        text_r = max(0, int(r * 0.45))
        text_g = max(0, int(g * 0.45))
        text_b = max(0, int(b * 0.45))
        
        return f"#{text_r:02x}{text_g:02x}{text_b:02x}"
    
    # Default fallback - moderately dark
    return "#2d3748"

def get_tinted_white_background(pattern_color):
    """Create a very white background with just a tiny tint from the pattern color."""
    if pattern_color.startswith('#'):
        hex_color = pattern_color[1:]
        r = int(hex_color[0:2], 16)
        g = int(hex_color[2:4], 16)
        b = int(hex_color[4:6], 16)
        
        # Mix pattern color with white (99% white, 1% pattern color) - much whiter
        white_weight = 0.99
        pattern_weight = 0.01
        
        tinted_r = int(255 * white_weight + r * pattern_weight)
        tinted_g = int(255 * white_weight + g * pattern_weight)
        tinted_b = int(255 * white_weight + b * pattern_weight)
        
        return f"#{tinted_r:02x}{tinted_g:02x}{tinted_b:02x}"
    
    return "#FEFEFE"  # Almost white fallback

def generate_radical_svg(radical_data, output_dir):
    """Generate a single portable radical SVG."""
    
    # For radical 78, use a more compatible character
    if radical_data['Number'] == '78':
        # Use the Kangxi radical form which has better font support
        radical_char = '⽍'  # Kangxi radical 78 (U+2F4D)
    else:
        radical_char = radical_data['Radical']
        
    meaning = radical_data['Meaning']
    category = radical_data['Category']
    number = radical_data['Number']
    
    # Get background configuration
    shape_type, bg_color = get_background_config(meaning, category)
    background_svg = generate_background_svg(shape_type, bg_color)
    
    # Get harmonious text color
    text_color = get_text_color(bg_color)
    
    # Get tinted white background
    background_fill = get_tinted_white_background(bg_color)
    
    # Use standard system fonts - no font embedding
    font_family = "'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'MS Gothic', 'SimSun', 'Takao', 'IPAexGothic', 'IPAGothic', 'VL Gothic', 'Noto Sans CJK JP', 'Arial Unicode MS', serif"
    
    # Create portable SVG content
    svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .radical-text {{
        font-family: {font_family};
        font-size: 200px;
        text-anchor: middle;
        dominant-baseline: middle;
        fill: {text_color};
        font-weight: bold;
      }}
      .number-text {{
        font-family: 'Helvetica', 'Arial', sans-serif;
        font-size: 20px;
        text-anchor: start;
        dominant-baseline: hanging;
        fill: {text_color};
        opacity: 0.7;
        font-weight: normal;
      }}
      .meaning-text {{
        font-family: 'Helvetica', 'Arial', sans-serif;
        font-size: 20px;
        text-anchor: middle;
        dominant-baseline: baseline;
        fill: {text_color};
        opacity: 0.8;
        font-weight: normal;
      }}
    </style>
  </defs>
  
  <!-- Background Fill -->
  <rect width="512" height="512" fill="{background_fill}"/>
  
  <!-- Background Pattern -->
  <g opacity="0.6">
    {background_svg}
  </g>
  
  <!-- Radical Character -->
  <text x="256" y="256" class="radical-text">{radical_char}</text>
  
  <!-- Number in top-left corner -->
  <text x="20" y="20" class="number-text">#{number}</text>
  
  <!-- Meaning at bottom -->
  <text x="256" y="480" class="meaning-text">{meaning}</text>
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