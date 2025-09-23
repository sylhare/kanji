#!/usr/bin/env python3
"""
Generate portable 512x512 SVG images for all radicals in r214.yml.
Refactored version with reduced duplication and better organization.
"""

import yaml
import os
import math
import random

# =============================================================================
# CONSTANTS
# =============================================================================

IMAGE_SIZE = 512
RADICAL_FONT_SIZE = 200
NUMBER_FONT_SIZE = 20
MEANING_FONT_SIZE = 20

# Text positioning
NUMBER_X, NUMBER_Y = 20, 20
RADICAL_X, RADICAL_Y = IMAGE_SIZE // 2, IMAGE_SIZE // 2
MEANING_X, MEANING_Y = IMAGE_SIZE // 2, 480

# Background tinting
WHITE_WEIGHT = 0.99
PATTERN_WEIGHT = 0.01

# Text color calculation
TEXT_COLOR_RATIO = 0.45

# Pattern opacities
PATTERN_OPACITIES = {
    'waves': 0.7,
    'triangles': [0.7, 0.6, 0.8, 0.5],
    'circles': [0.6, 0.7, 0.6, 0.5],
    'lines': [0.6, 0.5],
    'curves': 0.6,
    'squares': [0.6, 0.7, 0.6, 0.5],
    'spots': 0.6,
    'leaves': [0.6, 0.5, 0.7, 0.55, 0.65, 0.45, 0.6, 0.55, 0.7, 0.5],
    'flames': 0.7,
    'dots': 0.7,
    'default': 0.6
}

# Font stack for system compatibility
SYSTEM_FONT_STACK = "'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'MS Gothic', 'SimSun', 'Takao', 'IPAexGothic', 'IPAGothic', 'VL Gothic', 'Noto Sans CJK JP', 'Arial Unicode MS', serif"

# =============================================================================
# CONFIGURATION MAPPINGS
# =============================================================================

# Meaning-based mappings (take priority over category)
MEANING_MAPPINGS = {
    'water': (['water', 'river', 'ice', 'rain', 'steam'], 'waves', '#4169E1'),
    'mountain': (['mountain', 'hill', 'cliff', 'earth', 'stone'], 'triangles', '#8B4513'),
    'fire': (['fire', 'flame'], 'flames', '#FF4500'),
    'plant': (['tree', 'wood', 'grass', 'bamboo', 'grain', 'rice', 'sprout'], 'leaves', '#228B22'),
    'celestial': (['sun', 'moon', 'wind', 'evening'], 'circles', '#FFD700'),
    'body': (['hand', 'foot', 'eye', 'mouth', 'heart', 'body', 'head', 'ear', 'hair', 'face', 'nose'], 'curves', '#DC143C'),
    'animal': (['cow', 'dog', 'horse', 'bird', 'fish', 'sheep', 'pig', 'tiger', 'deer', 'frog', 'turtle'], 'spots', '#CD853F'),
    'weapon': (['knife', 'sword', 'axe', 'spear', 'bow', 'arrow', 'weapon'], 'lines', '#708090'),
}

# Category-based fallback mappings
CATEGORY_MAPPINGS = {
    'Nature': ('waves', '#4169E1'),
    'Body': ('curves', '#DC143C'),
    'Animal': ('spots', '#CD853F'),
    'Weapon': ('lines', '#708090'),
    'Home': ('squares', '#DDA0DD'),
    'Food': ('circles', '#FFD700'),
    'Agriculture': ('leaves', '#228B22'),
    'Clothing': ('curves', '#9370DB'),
    'Society': ('lines', '#4682B4'),
    'Color': ('spots', '#FF69B4'),
    'Number': ('dots', '#20B2AA'),
    'Ceremony': ('curves', '#B8860B'),
    'Fishing': ('waves', '#008B8B'),
    'Other': ('random_lines', '#696969'),
    'Capability': ('lines', '#2F4F4F'),
}

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple."""
    if not hex_color.startswith('#'):
        return None
    hex_color = hex_color[1:]
    return (
        int(hex_color[0:2], 16),
        int(hex_color[2:4], 16),
        int(hex_color[4:6], 16)
    )

def rgb_to_hex(r, g, b):
    """Convert RGB tuple to hex color."""
    return f"#{r:02x}{g:02x}{b:02x}"

def get_project_paths():
    """Get project root and common paths."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.join(script_dir, '..', '..')
    return {
        'project_root': project_root,
        'data_file': os.path.join(project_root, '_data', 'r214.yml'),
        'output_dir': os.path.join(project_root, 'assets', 'img', 'radicals_svg')
    }

# =============================================================================
# COLOR FUNCTIONS
# =============================================================================

def get_background_config(meaning, category):
    """Map radical meanings and categories to background shapes and colors."""
    meaning_lower = meaning.lower()
    
    # Check meaning-based mappings first
    for mapping_name, (keywords, shape, color) in MEANING_MAPPINGS.items():
        if any(word in meaning_lower for word in keywords):
            return shape, color
    
    # Fallback to category-based mapping
    return CATEGORY_MAPPINGS.get(category, ('random_lines', '#696969'))

def get_text_color(bg_color):
    """Get a darker text color for good readability on very white backgrounds."""
    rgb = hex_to_rgb(bg_color)
    if not rgb:
        return "#2d3748"
    
    r, g, b = rgb
    # Use darker colors to show more pattern color while staying readable
    text_r = max(0, int(r * TEXT_COLOR_RATIO))
    text_g = max(0, int(g * TEXT_COLOR_RATIO))
    text_b = max(0, int(b * TEXT_COLOR_RATIO))
    
    return rgb_to_hex(text_r, text_g, text_b)

def get_tinted_white_background(pattern_color):
    """Create a very white background with just a tiny tint from the pattern color."""
    rgb = hex_to_rgb(pattern_color)
    if not rgb:
        return "#FEFEFE"
    
    r, g, b = rgb
    # Mix pattern color with white
    tinted_r = int(255 * WHITE_WEIGHT + r * PATTERN_WEIGHT)
    tinted_g = int(255 * WHITE_WEIGHT + g * PATTERN_WEIGHT)
    tinted_b = int(255 * WHITE_WEIGHT + b * PATTERN_WEIGHT)
    
    return rgb_to_hex(tinted_r, tinted_g, tinted_b)

# =============================================================================
# PATTERN GENERATION FUNCTIONS
# =============================================================================

class PatternGenerator:
    """Handles generation of different background patterns."""
    
    def __init__(self, pattern_color):
        self.pattern_color = pattern_color
        self.elements = []
    
    def add_element(self, element):
        """Add an SVG element to the pattern."""
        self.elements.append(element)
    
    def get_opacity(self, pattern_type, index=0):
        """Get opacity for a pattern type and optional index."""
        opacity = PATTERN_OPACITIES.get(pattern_type, PATTERN_OPACITIES['default'])
        if isinstance(opacity, list):
            return opacity[index % len(opacity)]
        return opacity
    
    def generate_waves(self):
        """Generate wavy patterns with random phases."""
        random.seed(hash(self.pattern_color) % 1000)
        for i in range(0, IMAGE_SIZE, 50):
            phase_offset = random.uniform(0, math.pi * 2)
            amplitude = random.uniform(15, 35)
            path_data = f"M 0,{i + 40}"
            for x in range(10, IMAGE_SIZE + 20, 15):
                y = i + 40 + amplitude * math.sin(x * 0.02 + phase_offset)
                path_data += f" L {x},{y}"
            path_data += f" L {IMAGE_SIZE},{i + 50} L 0,{i + 50} Z"
            opacity = self.get_opacity('waves')
            self.add_element(f'<path d="{path_data}" fill="{self.pattern_color}" opacity="{opacity}"/>')
    
    def generate_triangles(self):
        """Generate triangular mountain-like patterns."""
        for i in range(4):
            x_offset = i * 150 - 50
            height_offset = 150 + i * 40
            points = f"{x_offset + 100},{IMAGE_SIZE} {x_offset + 200},{height_offset} {x_offset + 300},{IMAGE_SIZE}"
            opacity = self.get_opacity('triangles', i)
            self.add_element(f'<polygon points="{points}" fill="{self.pattern_color}" opacity="{opacity}"/>')
    
    def generate_circles(self):
        """Generate scattered circles with variations."""
        for i in range(12):
            x = (i * 123) % 450 + 50
            y = (i * 87) % 450 + 50
            radius = 25 + (i % 4) * 15
            style_choice = i % 3
            
            if style_choice == 0:
                opacity = self.get_opacity('circles', 0)
                self.add_element(f'<circle cx="{x}" cy="{y}" r="{radius}" fill="{self.pattern_color}" opacity="{opacity}"/>')
            elif style_choice == 1:
                opacity = self.get_opacity('circles', 1)
                self.add_element(f'<circle cx="{x}" cy="{y}" r="{radius}" fill="none" stroke="{self.pattern_color}" stroke-width="3" opacity="{opacity}"/>')
            else:
                opacity_outer = self.get_opacity('circles', 2)
                opacity_inner = self.get_opacity('circles', 3)
                self.add_element(f'<circle cx="{x}" cy="{y}" r="{radius}" fill="none" stroke="{self.pattern_color}" stroke-width="2" opacity="{opacity_outer}"/>')
                inner_radius = radius * 0.5
                self.add_element(f'<circle cx="{x}" cy="{y}" r="{inner_radius}" fill="{self.pattern_color}" opacity="{opacity_inner}"/>')
    
    def generate_lines(self):
        """Generate simple diagonal crosshatch pattern."""
        for i in range(0, IMAGE_SIZE, 40):
            opacity1 = self.get_opacity('lines', 0)
            self.add_element(f'<line x1="{i}" y1="0" x2="{i + 150}" y2="{IMAGE_SIZE}" stroke="{self.pattern_color}" stroke-width="4" opacity="{opacity1}"/>')
        for i in range(0, IMAGE_SIZE, 40):
            opacity2 = self.get_opacity('lines', 1)
            self.add_element(f'<line x1="0" y1="{i}" x2="{IMAGE_SIZE}" y2="{i + 150}" stroke="{self.pattern_color}" stroke-width="2" opacity="{opacity2}"/>')
    
    def generate_curves(self):
        """Generate curved filled areas."""
        for i in range(4):
            y_offset = i * 120
            path_data = f"M 0,{y_offset + 80}"
            for x in range(20, IMAGE_SIZE + 20, 20):
                y = y_offset + 80 + 25 * math.sin(x * 0.008 + i)
                path_data += f" L {x},{y}"
            path_data += f" L {IMAGE_SIZE},{y_offset + 120} L 0,{y_offset + 120} Z"
            opacity = self.get_opacity('curves')
            self.add_element(f'<path d="{path_data}" fill="{self.pattern_color}" opacity="{opacity}"/>')
    
    def generate_squares(self):
        """Generate rotated squares with variations."""
        for i in range(0, IMAGE_SIZE, 80):
            for j in range(0, IMAGE_SIZE, 80):
                x, y, size = i + 10, j + 10, 50
                center_x, center_y = x + size/2, y + size/2
                rotation = 15
                style_choice = (i//80 + j//80) % 3
                
                if style_choice == 0:
                    opacity = self.get_opacity('squares', 0)
                    self.add_element(f'<rect x="{x}" y="{y}" width="{size}" height="{size}" fill="{self.pattern_color}" opacity="{opacity}" transform="rotate({rotation} {center_x} {center_y})"/>')
                elif style_choice == 1:
                    opacity = self.get_opacity('squares', 1)
                    self.add_element(f'<rect x="{x}" y="{y}" width="{size}" height="{size}" fill="none" stroke="{self.pattern_color}" stroke-width="2" opacity="{opacity}" transform="rotate({rotation} {center_x} {center_y})"/>')
                else:
                    opacity_outer = self.get_opacity('squares', 2)
                    opacity_inner = self.get_opacity('squares', 3)
                    self.add_element(f'<rect x="{x}" y="{y}" width="{size}" height="{size}" fill="none" stroke="{self.pattern_color}" stroke-width="2" opacity="{opacity_outer}" transform="rotate({rotation} {center_x} {center_y})"/>')
                    inner_size = size * 0.6
                    inner_offset = (size - inner_size) / 2
                    self.add_element(f'<rect x="{x + inner_offset}" y="{y + inner_offset}" width="{inner_size}" height="{inner_size}" fill="{self.pattern_color}" opacity="{opacity_inner}" transform="rotate({rotation} {center_x} {center_y})"/>')
    
    def generate_spots(self):
        """Generate scattered dots."""
        for i in range(20):
            x = (i * 73) % IMAGE_SIZE
            y = (i * 97) % IMAGE_SIZE
            radius = 8 + (i % 4) * 3
            opacity = self.get_opacity('spots')
            self.add_element(f'<circle cx="{x}" cy="{y}" r="{radius}" fill="{self.pattern_color}" opacity="{opacity}"/>')
    
    def generate_leaves(self):
        """Generate leaf shapes with different shades."""
        for i in range(10):
            x = (i * 97) % IMAGE_SIZE
            y = (i * 73) % IMAGE_SIZE
            rx, ry = 20, 15
            rotation = i * 36
            opacity = self.get_opacity('leaves', i)
            self.add_element(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{self.pattern_color}" opacity="{opacity}" transform="rotate({rotation} {x} {y})"/>')
    
    def generate_flames(self):
        """Generate flame-like curves."""
        for i in range(6):
            x_base = i * 90 + 50
            path_data = f"M {x_base},{IMAGE_SIZE}"
            for j in range(1, 10):
                x = x_base + 10 * math.sin(j * 0.5)
                y = IMAGE_SIZE - j * 40
                path_data += f" L {x},{y}"
            opacity = self.get_opacity('flames')
            self.add_element(f'<path d="{path_data}" stroke="{self.pattern_color}" stroke-width="4" fill="none" opacity="{opacity}"/>')
    
    def generate_dots(self):
        """Generate regular dot pattern."""
        for i in range(0, IMAGE_SIZE, 80):
            for j in range(0, IMAGE_SIZE, 80):
                opacity = self.get_opacity('dots')
                self.add_element(f'<circle cx="{i}" cy="{j}" r="3" fill="{self.pattern_color}" opacity="{opacity}"/>')
    
    def generate_random_lines(self):
        """Generate random-ish lines."""
        for i in range(8):
            x1, y1 = (i * 70) % IMAGE_SIZE, (i * 90) % IMAGE_SIZE
            x2, y2 = (x1 + 150) % IMAGE_SIZE, (y1 + 100) % IMAGE_SIZE
            opacity = self.get_opacity('default')
            self.add_element(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{self.pattern_color}" stroke-width="2" opacity="{opacity}"/>')
    
    def generate_pattern(self, shape_type):
        """Generate pattern based on shape type."""
        pattern_methods = {
            'waves': self.generate_waves,
            'triangles': self.generate_triangles,
            'circles': self.generate_circles,
            'lines': self.generate_lines,
            'curves': self.generate_curves,
            'squares': self.generate_squares,
            'spots': self.generate_spots,
            'leaves': self.generate_leaves,
            'flames': self.generate_flames,
            'dots': self.generate_dots,
            'random_lines': self.generate_random_lines,
        }
        
        method = pattern_methods.get(shape_type, self.generate_random_lines)
        method()
        return '\n    '.join(self.elements)

# =============================================================================
# SVG GENERATION
# =============================================================================

def generate_radical_svg(radical_data, output_dir):
    """Generate a single portable radical SVG."""
    
    # Handle special case for radical 78
    if radical_data['Number'] == '78':
        radical_char = '⽍'  # Kangxi radical 78 (U+2F4D)
    else:
        radical_char = radical_data['Radical']
    
    meaning = radical_data['Meaning']
    category = radical_data['Category']
    number = radical_data['Number']
    
    # Get colors and patterns
    shape_type, bg_color = get_background_config(meaning, category)
    text_color = get_text_color(bg_color)
    background_fill = get_tinted_white_background(bg_color)
    
    # Generate background pattern
    pattern_generator = PatternGenerator(bg_color)
    background_svg = pattern_generator.generate_pattern(shape_type)
    
    # Create SVG content
    svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{IMAGE_SIZE}" height="{IMAGE_SIZE}" viewBox="0 0 {IMAGE_SIZE} {IMAGE_SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .radical-text {{
        font-family: {SYSTEM_FONT_STACK};
        font-size: {RADICAL_FONT_SIZE}px;
        text-anchor: middle;
        dominant-baseline: middle;
        fill: {text_color};
        font-weight: bold;
      }}
      .number-text {{
        font-family: 'Helvetica', 'Arial', sans-serif;
        font-size: {NUMBER_FONT_SIZE}px;
        text-anchor: start;
        dominant-baseline: hanging;
        fill: {text_color};
        opacity: 0.7;
        font-weight: normal;
      }}
      .meaning-text {{
        font-family: 'Helvetica', 'Arial', sans-serif;
        font-size: {MEANING_FONT_SIZE}px;
        text-anchor: middle;
        dominant-baseline: baseline;
        fill: {text_color};
        opacity: 0.8;
        font-weight: normal;
      }}
    </style>
  </defs>
  
  <!-- Background Fill -->
  <rect width="{IMAGE_SIZE}" height="{IMAGE_SIZE}" fill="{background_fill}"/>
  
  <!-- Background Pattern -->
  <g opacity="0.6">
    {background_svg}
  </g>
  
  <!-- Radical Character -->
  <text x="{RADICAL_X}" y="{RADICAL_Y}" class="radical-text">{radical_char}</text>
  
  <!-- Number in top-left corner -->
  <text x="{NUMBER_X}" y="{NUMBER_Y}" class="number-text">#{number}</text>
  
  <!-- Meaning at bottom -->
  <text x="{MEANING_X}" y="{MEANING_Y}" class="meaning-text">{meaning}</text>
</svg>'''
    
    # Save the SVG
    filename = f"radical_{int(number):03d}.svg"
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    
    print(f"Generated: {filename} ({meaning})")
    return filepath

# =============================================================================
# MAIN FUNCTION
# =============================================================================

def main():
    """Generate all portable radical SVGs."""
    
    # Get paths
    paths = get_project_paths()
    os.makedirs(paths['output_dir'], exist_ok=True)
    
    # Load radical data
    try:
        with open(paths['data_file'], 'r', encoding='utf-8') as file:
            radicals_data = yaml.safe_load(file)
    except FileNotFoundError:
        print(f"Error: {paths['data_file']} file not found!")
        return
    except Exception as e:
        print(f"Error loading YAML file: {e}")
        return
    
    # Generate SVGs
    print(f"Portable Radical SVG Generator")
    print("=" * 50)
    print(f"Data source: {os.path.relpath(paths['data_file'])}")
    print(f"Output directory: {os.path.relpath(paths['output_dir'])}")
    print(f"Generating {len(radicals_data)} radical SVG images...")
    print("-" * 50)
    
    generated_count = 0
    
    for radical_data in radicals_data:
        try:
            generate_radical_svg(radical_data, paths['output_dir'])
            generated_count += 1
        except Exception as e:
            print(f"❌ Error generating SVG for radical {radical_data.get('Number', '?')}: {e}")
    
    print("-" * 50)
    print(f"✅ Generation complete! Generated {generated_count} portable SVG images.")
    print(f"📁 Images saved in: {os.path.abspath(paths['output_dir'])}")
    print("\n🚀 These SVGs are fully portable and can be moved anywhere!")

if __name__ == "__main__":
    main()