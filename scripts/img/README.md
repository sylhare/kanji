# Image Generation Scripts

This directory contains scripts for generating and processing images used in the kanji project.

## 📋 Requirements

Install the required dependencies:
```bash
pip install -r requirements.txt
```

## 🤖 AI Image Generation

### `generate_radical_images.py`

Generates Japanese radical images using various AI models (Stable Diffusion, FLUX, etc.).

```bash
# Generate with default model (tiny-sd)
python generate_radical_images.py --test

# Generate all 214 radicals with a specific model
python generate_radical_images.py --model dreamlike --all

# Generate specific radicals  
python generate_radical_images.py --model sketch --radicals 1 2 3
```

**Output:** Images saved to `../../_data/assets/img/radical/generated-{model}/`

### `generate_all_styles.py`

Batch generation across multiple AI models - tests all available artistic styles.

```bash
# Test all models with 3 radicals each
python generate_all_styles.py --test

# Generate all 214 radicals with all models (long process)
python generate_all_styles.py --full

# Test specific models only
python generate_all_styles.py --models tiny-sd dreamlike
```

**Output:** Images saved to model-specific folders, results logged to `../../multi_style_results/`

## 🎨 SVG Generation

### `generate_radical_svgs.py`

Generates 512×512 portable SVG images for all 214 radicals with contextual backgrounds.

```bash
python generate_radical_svgs.py
```

**Output:** `../../assets/img/radicals_svg/radical_001.svg` through `radical_214.svg`

## 🖼️ Image Processing

### `batch_resize_images.py`

Resizes images to 512x512 using center crop (no padding).

```bash
# Resize images from default folder
python batch_resize_images.py

# Resize from specific folder
python batch_resize_images.py /path/to/images -o output_folder

# Custom size
python batch_resize_images.py -s 1024
```

**Output:** Resized images saved to `resized_images/` folder

### `optimize_png_images.py`

Optimizes PNG files for smaller size while preserving quality and dimensions.

```bash
# Optimize default folder
python optimize_png_images.py

# Optimize specific folder
python optimize_png_images.py /path/to/pngs output_folder

# Maximum compression
python optimize_png_images.py -q 9
```

**Output:** Optimized images saved to `optimized_images/` folder

