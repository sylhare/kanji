#!/usr/bin/env python3
"""
Apple Silicon M4 Optimized Radical Image Generator
"""

import yaml
import torch
import time
import os
import random
import gc
import uuid
import argparse
from pathlib import Path
from diffusers import StableDiffusionPipeline, DiffusionPipeline, EulerDiscreteScheduler
from PIL import Image
import numpy as np
import psutil

# Set ultra-conservative MPS memory management
os.environ['PYTORCH_MPS_HIGH_WATERMARK_RATIO'] = '0.7'  # Use only 70% of available memory
os.environ['PYTORCH_MPS_LOW_WATERMARK_RATIO'] = '0.5'   # Start cleanup at 50%

class M4OptimizedRadicalGenerator:
    def __init__(self, model_id="segmind/tiny-sd", batch_size=None, delay_between_batches=8):
        """
        M4 MacBook Pro ultra-conservative image generator.
        
        Args:
            model_id: Hugging Face model ID to use (default: Tiny-SD for efficiency)
            batch_size: Auto-optimized for M4 if None  
            delay_between_batches: Seconds to wait between batches (reduced for faster model)
        """
        self.model_id = model_id
        self.delay_between_batches = delay_between_batches
        
        # M4 specific optimizations
        self.device = self._detect_optimal_device()
        self.batch_size = batch_size or self._optimize_batch_size()
        
        # Check for HF token (only required for some FLUX models)
        self.hf_token = os.getenv('HF_TOKEN')
        if not self.hf_token and "flux.1-dev" in self.model_id.lower():
            print("❌ ERROR: HF_TOKEN required for FLUX.1-dev model!")
            print("💡 Set your token: export HF_TOKEN='your_token_here'")
            print("💡 Get token from: https://huggingface.co/settings/tokens")
            print("💡 Or use FLUX.1-schnell which doesn't need a token")
        elif not self.hf_token and "flux" in self.model_id.lower():
            print("✅ Using FLUX.1-schnell (no token required)")
        elif not self.hf_token:
            print("✅ Using public model (no token required)")
        
        # Create output directory with model name and random ID - updated path from scripts/img/ folder
        model_name = self.model_id.split('/')[-1].replace('.', '-').lower()
        random_folder_name = f"generated-{model_name}-{uuid.uuid4().hex[:8]}"
        self.output_dir = Path("../../assets/img/radical") / random_folder_name
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Create logs directory in the same folder as the script
        self.logs_dir = Path('./logs')
        self.logs_dir.mkdir(exist_ok=True)
        
        print(f"📁 Output directory: {self.output_dir}")
        print(f"📋 Logs directory: {self.logs_dir}")
        
        self.pipe = None
        self.generation_count = 0
        
        # M4 memory monitoring optimized for model type
        if "flux" in self.model_id.lower():
            self.max_images_per_session = 8   # Conservative for FLUX
        elif "tiny-sd" in self.model_id.lower():
            self.max_images_per_session = 25  # Tiny-SD is very memory efficient
        elif "stable-diffusion-v1" in self.model_id.lower():
            self.max_images_per_session = 15  # SD1.x is more memory efficient
        elif "dreamlike" in self.model_id.lower():
            self.max_images_per_session = 12  # Fine-tuned models
        else:
            self.max_images_per_session = 10  # Default for other models
            
        # For M4 Pro/Max, you could increase these limits:
        # self.max_images_per_session = 35  # More aggressive for M4 Pro/Max
        self.memory_check_interval = 1   # Check memory after every image
        print(f"🛡️  Ultra-conservative mode: Limited to {self.max_images_per_session} images per session")
        print(f"🔍 Memory monitoring: Check every {self.memory_check_interval} images")
        
        # Pre-check memory before initialization
        self._pre_check_memory_availability()
    
    def _pre_check_memory_availability(self):
        """Check if system has enough memory before starting."""
        available_gb, used_percent = self._get_memory_info()
        
        print(f"💾 Pre-flight memory check:")
        print(f"   Available: {available_gb:.1f}GB")
        print(f"   Used: {used_percent:.1f}%")
        
        if available_gb < 4.0:
            print("⚠️  WARNING: Low available memory detected!")
            print("💡 Consider closing other applications before proceeding")
        
        if used_percent > 80:
            print("⚠️  WARNING: High memory usage detected!")
            print("💡 Consider restarting your system for optimal performance")
            
        print("✅ Memory pre-check complete")
    
    def _clear_model_cache(self):
        """Clear the model cache for this specific model to force re-download."""
        import shutil
        from huggingface_hub import snapshot_download
        
        # Convert model_id to cache directory name
        cache_model_name = self.model_id.replace('/', '--')
        cache_path = Path.home() / '.cache' / 'huggingface' / 'hub' / f'models--{cache_model_name}'
        
        if cache_path.exists():
            print(f"🧹 Clearing cache for {self.model_id}...")
            try:
                shutil.rmtree(cache_path)
                print(f"✅ Model cache cleared: {cache_path}")
            except Exception as e:
                print(f"⚠️  Warning: Could not clear cache: {e}")
        else:
            print(f"💡 No cache found for {self.model_id}")
        
    def _get_memory_info(self):
        """Get current memory usage information."""
        memory = psutil.virtual_memory()
        available_gb = memory.available / (1024**3)
        used_percent = memory.percent
        return available_gb, used_percent
        
    def _detect_optimal_device(self):
        """Detect the best device for M4 MacBook Pro."""
        if torch.backends.mps.is_available():
            print("🍎 Apple Silicon M4 MPS detected")
            # Verify MPS is working properly
            try:
                test_tensor = torch.randn(10, 10).to('mps')
                _ = torch.mm(test_tensor, test_tensor)
                print("✅ MPS verification successful")
                return 'mps'
            except Exception as e:
                print(f"⚠️  MPS test failed: {e}, falling back to CPU")
                return 'cpu'
        elif torch.cuda.is_available():
            print("🖥️  CUDA GPU detected")
            return 'cuda'
        else:
            print("🖥️  Using CPU")
            return 'cpu'
    
    def _optimize_batch_size(self):
        """Ultra-conservative batch size for M4 chip to prevent OOM."""
        if self.device == 'mps':
            return 1  # Single image only for MPS to prevent OOM
        elif self.device == 'cuda':
            return 1  # Single image for CUDA too (conservative)
        else:
            return 1  # Single image for CPU
    
    def initialize_pipeline(self, force_reload=False):
        """Initialize the diffusion pipeline with M4 optimizations."""
        print(f"🚀 Initializing pipeline for M4 MacBook Pro...")
        print(f"📦 Model: {self.model_id}")
        print(f"🖥️  Device: {self.device}")
        
        # Clear cache if force_reload is requested
        if force_reload:
            self._clear_model_cache()
        
        try:
            # M4 specific dtype selection to prevent black images
            if self.device == 'mps':
                # Use float32 for MPS to prevent black image issues
                torch_dtype = torch.float32
                print("🍎 Using float32 for MPS stability (prevents black images)")
            elif self.device == 'cuda':
                torch_dtype = torch.float16
                print("🖥️  Using float16 for CUDA efficiency")
            else:
                torch_dtype = torch.float32
                print("🖥️  Using float32 for CPU compatibility")
            
            # Load pipeline - use DiffusionPipeline for FLUX models
            if "flux" in self.model_id.lower():
                print("🔥 Loading FLUX model for enhanced quality")
                try:
                    if self.hf_token and "flux.1-dev" in self.model_id.lower():
                        # Only use token for dev model
                        self.pipe = DiffusionPipeline.from_pretrained(
                            self.model_id,
                            torch_dtype=torch_dtype,
                            token=self.hf_token
                        )
                    else:
                        # No token needed for schnell
                        self.pipe = DiffusionPipeline.from_pretrained(
                            self.model_id,
                            torch_dtype=torch_dtype
                        )
                except Exception as flux_error:
                    if "diffusion_pytorch_model.safetensors" in str(flux_error):
                        print("⚠️  FLUX model cache appears corrupted (missing safetensors files)")
                        print("🔄 Attempting to clear cache and reload...")
                        self._clear_model_cache()
                        # Retry loading after cache clear
                        if self.hf_token and "flux.1-dev" in self.model_id.lower():
                            self.pipe = DiffusionPipeline.from_pretrained(
                                self.model_id,
                                torch_dtype=torch_dtype,
                                token=self.hf_token
                            )
                        else:
                            self.pipe = DiffusionPipeline.from_pretrained(
                                self.model_id,
                                torch_dtype=torch_dtype
                            )
                    else:
                        raise flux_error
            else:
                print("🎨 Loading Stable Diffusion model")
                try:
                    self.pipe = StableDiffusionPipeline.from_pretrained(
                        self.model_id,
                        torch_dtype=torch_dtype,
                        token=self.hf_token,
                        safety_checker=None,  # Disable for speed
                        requires_safety_checker=False
                    )
                except Exception as model_error:
                    if "diffusion_pytorch_model.safetensors" in str(model_error):
                        print("⚠️  Model cache appears corrupted (missing safetensors files)")
                        print("🔄 Attempting to clear cache and reload...")
                        self._clear_model_cache()
                        # Retry loading after cache clear
                        self.pipe = StableDiffusionPipeline.from_pretrained(
                            self.model_id,
                            torch_dtype=torch_dtype,
                            token=self.hf_token,
                            safety_checker=None,
                            requires_safety_checker=False
                        )
                    else:
                        raise model_error
            
            # Move to device
            self.pipe = self.pipe.to(self.device)
            
            # M4 specific optimizations
            if self.device == 'mps':
                self._apply_mps_optimizations()
            elif self.device == 'cuda':
                self._apply_cuda_optimizations()
            else:
                self._apply_cpu_optimizations()
            
            print("✅ Pipeline initialized successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Failed to initialize pipeline: {e}")
            print(f"💡 Trying fallback to CPU...")
            return self._fallback_to_cpu()
    
    def _apply_mps_optimizations(self):
        """Apply M4 specific MPS optimizations."""
        # Enable attention slicing for memory efficiency
        if hasattr(self.pipe, 'enable_attention_slicing'):
            self.pipe.enable_attention_slicing(1)  # Conservative slicing
            print("✅ Enabled attention slicing for M4")
        
        # Set deterministic algorithms to prevent black images
        torch.backends.cudnn.deterministic = True
        torch.backends.cudnn.benchmark = False
        
        # Enable model CPU offloading if available
        if hasattr(self.pipe, 'enable_model_cpu_offload'):
            try:
                self.pipe.enable_model_cpu_offload()
                print("✅ Enabled model CPU offloading for M4")
            except:
                print("⚠️  CPU offloading not available")
        
        print("🍎 Applied M4 MPS optimizations")
    
    def _apply_cuda_optimizations(self):
        """Apply CUDA optimizations."""
        if hasattr(self.pipe, 'enable_attention_slicing'):
            self.pipe.enable_attention_slicing()
        
        if hasattr(self.pipe, 'enable_xformers_memory_efficient_attention'):
            try:
                self.pipe.enable_xformers_memory_efficient_attention()
                print("✅ Enabled xformers optimization")
            except:
                pass
    
    def _apply_cpu_optimizations(self):
        """Apply CPU optimizations."""
        if hasattr(self.pipe, 'enable_attention_slicing'):
            self.pipe.enable_attention_slicing()
    
    def _force_memory_cleanup(self):
        """Aggressively clean up memory."""
        if self.device == 'mps':
            torch.mps.empty_cache()
        elif self.device == 'cuda':
            torch.cuda.empty_cache()
        
        # Force Python garbage collection
        gc.collect()
        
        # Small delay to let cleanup complete
        time.sleep(2)
    
    def _check_memory_safety(self):
        """Enhanced memory safety check with aggressive cleanup."""
        available_gb, used_percent = self._get_memory_info()
        
        print(f"💾 Memory: {available_gb:.1f}GB available, {used_percent:.1f}% used")
        
        # Force cleanup if memory usage is high
        if used_percent > 85:
            print("⚠️  High memory usage detected, forcing cleanup...")
            self._force_memory_cleanup()
            
            # Check again after cleanup
            available_gb, used_percent = self._get_memory_info()
            print(f"💾 After cleanup: {available_gb:.1f}GB available, {used_percent:.1f}% used")
        
        # Check generation count limit
        if self.generation_count >= self.max_images_per_session:
            print(f"🛑 Memory safety limit reached ({self.max_images_per_session} images)")
            print("💡 Please restart the script to continue with fresh memory")
            return False
        
        # Check available memory 
        if available_gb < 2.0:  # Less than 2GB available
            print(f"🛑 Low memory warning: Only {available_gb:.1f}GB available")
            print("💡 Please restart the script with fresh memory")
            return False
            
        return True
    
    def _fallback_to_cpu(self):
        """Fallback to CPU if MPS fails."""
        try:
            self.device = 'cpu'
            
            # Try efficient models first, then fallback to larger ones
            models_to_try = [
                self.model_id,  # Original model
                "segmind/tiny-sd",                    # Tiny efficient model
                "runwayml/stable-diffusion-v1-5",    # Standard SD1.5
                "stabilityai/stable-diffusion-2"     # Reliable fallback
            ]
            
            for model_id in models_to_try:
                try:
                    print(f"🔄 Trying CPU fallback with: {model_id}")
                    
                    if "flux" in model_id.lower():
                        if self.hf_token and "flux.1-dev" in model_id.lower():
                            self.pipe = DiffusionPipeline.from_pretrained(
                                model_id,
                                torch_dtype=torch.float32,
                                token=self.hf_token
                            )
                        else:
                            self.pipe = DiffusionPipeline.from_pretrained(
                                model_id,
                                torch_dtype=torch.float32
                            )
                    else:
                        self.pipe = StableDiffusionPipeline.from_pretrained(
                            model_id,
                            torch_dtype=torch.float32,
                            token=self.hf_token,
                            safety_checker=None,
                            requires_safety_checker=False
                        )
                    
                    self.pipe = self.pipe.to('cpu')
                    self._apply_cpu_optimizations()
                    self.model_id = model_id  # Update model_id
                    print(f"✅ CPU fallback successful with: {model_id}")
                    return True
                    
                except Exception as e:
                    print(f"❌ Failed {model_id}: {e}")
                    continue
            
            print("❌ All CPU fallback attempts failed")
            return False
            
        except Exception as e:
            print(f"❌ CPU fallback error: {e}")
            return False
    
    def load_all_radicals(self):
        """Load all radicals from r214.yml file."""
        # Use r214.yml file in the project root (relative to scripts/img/ folder)
        r214_file = Path('../../_data/r214.yml')
        
        if not r214_file.exists():
            print(f"❌ r214.yml file not found: {r214_file}")
            return []
        
        print("📚 Loading radicals from r214.yml...")
        
        try:
            with open(r214_file, 'r', encoding='utf-8') as f:
                content = yaml.safe_load(f)
                
            if not content:
                print("❌ r214.yml file is empty or invalid")
                return []
            
            # Convert the structure to match what the rest of the code expects
            all_radicals = []
            for radical_data in content:
                # Transform the r214.yml structure to match expected format
                transformed = {
                    'number': int(radical_data.get('Number', 0)),
                    'radical': radical_data.get('Radical', '?'),
                    'meaning': radical_data.get('Meaning', 'unknown'),
                    'category': radical_data.get('Category', 'unknown'),
                    'reading_j': radical_data.get('Reading-J', ''),
                    'reading_r': radical_data.get('Reading-R', ''),
                    'strokes': radical_data.get('Strokes', '1'),
                    'frequency': radical_data.get('Frequency', '0'),
                    'examples': radical_data.get('Examples', ''),
                    # Use interpretation from guide if available, otherwise fall back to meaning
                    'interpretation': radical_data.get('Interpretation', radical_data.get('Meaning', 'unknown'))
                }
                all_radicals.append(transformed)
                    
        except Exception as e:
            print(f"  ⚠️  Error loading r214.yml: {e}")
            return []
        
        print(f"✅ Loaded {len(all_radicals)} radicals total")
        return all_radicals
    
    def create_prompt(self, radical):
        """Create optimized prompt for different art styles."""
        number = radical.get('number', '?')
        character = radical.get('radical', '?')
        meaning = radical.get('meaning', 'unknown')
        category = radical.get('category', 'unknown')
        interpretation = radical.get('interpretation', 'unknown')  
        
        # Use interpretation from guide files for richer description, fallback to meaning
        if interpretation != 'unknown' and interpretation != meaning:
            representation = interpretation
        else:
            representation = meaning
            if category.lower() != 'unknown' and category.lower() != 'other':
                representation = f"{meaning}, {category.lower()} related"
        
        # Customize prompt based on model type
        if ("anime" in self.model_id.lower() or "anything" in self.model_id.lower() or 
            "heartsync" in self.model_id.lower() or "dreamshaper" in self.model_id.lower() or
            "counterfeit" in self.model_id.lower() or "waifu" in self.model_id.lower()):
            # Anime-optimized prompts
            prompt = f"Anime style illustration of {representation}, clean lineart, vibrant colors, simple design, high quality, detailed"
                
            # Add negative prompt for anime models
            if hasattr(self, '_current_negative_prompt'):
                self._current_negative_prompt = "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry"
        else:
            prompt = f"{representation}."
      
        return prompt  
    
    def _generate_with_validation(self, prompt, seed=None):
        """Generate image with black image detection and retry."""
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                # Set random seed for consistency
                if seed is None:
                    seed = random.randint(0, 2**32 - 1)
                
                generator = torch.Generator(device=self.device).manual_seed(seed)
                
                # Ultra-conservative M4 generation parameters
                with torch.no_grad():
                    if self.device == 'mps':
                        # Optimized settings for different model types on MPS
                        if "flux" in self.model_id.lower():
                            # Extra conservative for FLUX
                            result = self.pipe(
                                prompt=prompt,
                                height=512,              # Extra small for FLUX memory requirements
                                width=512,               # Extra small for FLUX memory requirements
                                num_inference_steps=12,  # Fewer steps for FLUX
                                guidance_scale=5.0,      # Lower guidance for FLUX stability
                                generator=generator
                            )
                        elif "tiny-sd" in self.model_id.lower():
                            # Optimized for Tiny-SD model (very efficient)
                            result = self.pipe(
                                prompt=prompt,
                                height=512,              # Standard resolution for Tiny-SD
                                width=512,               # Standard resolution for Tiny-SD
                                num_inference_steps=12,  # Fewer steps work well for Tiny-SD
                                guidance_scale=6.0,      # Lower guidance for efficiency
                                generator=generator,
                                negative_prompt="blurry, low quality, distorted, dark"
                            )
                        elif "stable-diffusion-v1" in self.model_id.lower():
                            # Optimized for SD1.x models (more efficient)
                            result = self.pipe(
                                prompt=prompt,
                                height=512,              # Higher resolution for SD1.x
                                width=512,               # Higher resolution for SD1.x
                                num_inference_steps=18,  # Good quality steps for SD1.x
                                guidance_scale=7.5,      # Standard guidance for SD1.x
                                generator=generator,
                                negative_prompt="blurry, low quality, distorted, dark"
                            )
                        else:
                            # Conservative settings for other models (including anime models)
                            if ("anime" in self.model_id.lower() or "anything" in self.model_id.lower() or
                                "dreamshaper" in self.model_id.lower() or "counterfeit" in self.model_id.lower() or
                                "waifu" in self.model_id.lower()):
                                # Anime model optimizations
                                result = self.pipe(
                                    prompt=prompt,
                                    height=512,              # Balanced resolution
                                    width=512,               # Balanced resolution
                                    num_inference_steps=20,  # More steps for anime quality
                                    guidance_scale=7.5,      # Higher guidance for anime
                                    generator=generator,
                                    negative_prompt="lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry"
                                )
                            else:
                                # Default settings for other models
                                result = self.pipe(
                                    prompt=prompt,
                                    height=512,              # Balanced resolution
                                    width=512,               # Balanced resolution
                                    num_inference_steps=15,  # Balanced steps
                                    guidance_scale=6.0,      # Lower guidance for stability
                                    generator=generator,
                                    negative_prompt="blurry, low quality, distorted"
                                )
                    else:
                        # Conservative settings for other devices
                        result = self.pipe(
                            prompt=prompt,
                            height=512,              # Reduced size for memory conservation
                            width=512,               # Reduced size for memory conservation
                            num_inference_steps=15,  # Reduced steps
                            guidance_scale=7.0,
                            generator=generator
                        )
                
                image = result.images[0]
                
                # Check if image is black (common MPS issue)
                img_array = np.array(image)
                mean_brightness = np.mean(img_array)
                
                if mean_brightness < 10:  # Very dark image
                    print(f"⚠️  Attempt {attempt + 1}: Dark image detected (brightness: {mean_brightness:.1f}), retrying...")
                    seed = random.randint(0, 2**32 - 1)  # New seed
                    continue
                
                print(f"✅ Good image generated (brightness: {mean_brightness:.1f})")
                return image
                
            except Exception as e:
                print(f"⚠️  Attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    raise e
                seed = random.randint(0, 2**32 - 1)
        
        raise Exception("Failed to generate valid image after all retries")
    
    def generate_image(self, radical):
        """Generate a single image for a radical with M4 optimizations."""
        number = radical.get('number', '?')
        character = radical.get('radical', '?')
        
        output_file = self.output_dir / f"radical_{number:03d}.png"
        
        # Skip if already exists
        if output_file.exists():
            print(f"⏭️  Skipping radical {number} (already exists)")
            return True
        
        prompt = self.create_prompt(radical)
        print(f"🎨 Generating image for radical {number} ({character})...")
        print(f"   Prompt: ...{prompt[-80:]}")
        
        try:
            # Generate with validation
            image = self._generate_with_validation(prompt)
            
            # Resize to 500x500
            # image = image.resize((500, 500), Image.Resampling.LANCZOS)
            
            # Save image
            image.save(output_file, "PNG", quality=95)
            print(f"✅ Saved: {output_file}")
            
            self.generation_count += 1
            
            # Ultra-aggressive M4 memory management after EVERY image
            print("🧹 Performing aggressive memory cleanup...")
            self._force_memory_cleanup()
            
            # Additional delay for M4 stability (reduced for Tiny-SD efficiency)
            if self.device == 'mps':
                time.sleep(2)  # Shorter delay for efficient Tiny-SD model
                print("⏳ MPS memory stabilization complete")
            
            return True
            
        except Exception as e:
            print(f"❌ Error generating image for radical {number}: {e}")
            print(f"🔄 Continuing with next radical...")
            return False
    
    def generate_test_images(self, test_radicals=[4, 5, 6]):
        """Generate test images for specific radicals (0-based indices)."""
        print(f"🧪 Testing M4 optimized generation on radicals: {[i+1 for i in test_radicals]}")
        print("=" * 60)
        
        if not self.initialize_pipeline():
            return False
        
        radicals = self.load_all_radicals()
        if not radicals:
            print("❌ No radicals found")
            return False
        
        # Get specific test radicals
        test_radical_objects = [radicals[i] for i in test_radicals if i < len(radicals)]
        success_count = 0
        
        for i, radical in enumerate(test_radical_objects):
            if self.generate_image(radical):
                success_count += 1
            
            # Small delay between images (reduced for Tiny-SD efficiency)
            if i < len(test_radical_objects) - 1:
                print("⏳ Brief pause...")
                time.sleep(2)
        
        # Save test log
        model_name = self.model_id.split('/')[-1].replace('.', '-').lower()
        log_file = self.logs_dir / f"test_log_{model_name}_{int(time.time())}.txt"
        with open(log_file, 'w') as f:
            f.write(f"M4 Test Complete!\n")
            f.write(f"Model: {self.model_id}\n")
            f.write(f"Device: {self.device}\n")
            f.write(f"Test radicals: {[i+1 for i in test_radicals]}\n")
            f.write(f"Success: {success_count}/{len(test_radical_objects)}\n")
            f.write(f"Images saved to: {self.output_dir}\n")
            f.write(f"Test time: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        print(f"✅ M4 test complete: {success_count}/{len(test_radical_objects)} images generated successfully")
        print(f"📋 Test log saved to: {log_file}")
        return success_count > 0
    
    def generate_all_images(self):
        """Generate all 214 radical images with M4 optimizations."""
        print("🚀 Starting M4 optimized radical generation...")
        print("=" * 50)
        
        if not self.initialize_pipeline():
            return False
        
        radicals = self.load_all_radicals()
        if not radicals:
            print("❌ No radicals found")
            return False
        
        total_radicals = len(radicals)
        success_count = 0
        failed_radicals = []
        
        print(f"📊 Total radicals: {total_radicals}")
        print(f"📦 Batch size: {self.batch_size}")
        print(f"⏱️  Delay: {self.delay_between_batches}s")
        print(f"🖥️  Device: {self.device}")
        print()
        
        # Process in batches
        for batch_start in range(0, total_radicals, self.batch_size):
            batch_end = min(batch_start + self.batch_size, total_radicals)
            batch_radicals = radicals[batch_start:batch_end]
            batch_num = (batch_start // self.batch_size) + 1
            total_batches = (total_radicals + self.batch_size - 1) // self.batch_size
            
            print(f"📦 Batch {batch_num}/{total_batches} ({len(batch_radicals)} radicals)")
            
            for radical in batch_radicals:
                # Check memory safety before each image
                if not self._check_memory_safety():
                    print(f"🛑 Stopping generation for memory safety")
                    print(f"📊 Generated {success_count} images before stopping")
                    return success_count > 0
                
                if self.generate_image(radical):
                    success_count += 1
                else:
                    failed_radicals.append(radical.get('number', '?'))
            
            # Extended wait between batches for M4 stability
            if batch_end < total_radicals:
                wait_time = self.delay_between_batches
                if self.device == 'mps':
                    wait_time = max(wait_time, 8)  # Minimum 8s for MPS with Tiny-SD
                print(f"⏳ Waiting {wait_time}s for M4 stability...")
                time.sleep(wait_time)
                
                # Extra memory cleanup between batches
                if self.device == 'mps':
                    torch.mps.empty_cache()
                    import gc
                    gc.collect()
                    print("🧹 Deep memory cleanup between batches")
            print()
        
        # Save generation log
        model_name = self.model_id.split('/')[-1].replace('.', '-').lower()
        log_file = self.logs_dir / f"generation_log_{model_name}_{int(time.time())}.txt"
        with open(log_file, 'w') as f:
            f.write(f"M4 Generation Complete!\n")
            f.write(f"Model: {self.model_id}\n")
            f.write(f"Device: {self.device}\n")
            f.write(f"Success: {success_count}/{total_radicals}\n")
            f.write(f"Failed: {len(failed_radicals)}\n")
            if failed_radicals:
                f.write(f"Failed radicals: {failed_radicals}\n")
            f.write(f"Images saved to: {self.output_dir}\n")
            f.write(f"Generation time: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        # Final summary
        print("🎉 M4 Generation Complete!")
        print(f"✅ Success: {success_count}/{total_radicals}")
        print(f"❌ Failed: {len(failed_radicals)}")
        
        if failed_radicals:
            print(f"🔄 Failed radicals: {failed_radicals[:10]}...")  # Show first 10
        
        print(f"📁 Images saved to: {self.output_dir}")
        print(f"📋 Log saved to: {log_file}")
        return success_count > 0

def generate_in_safe_chunks(start_radical=1, chunk_size=20):
    """
    Generate images in safe memory chunks to prevent freezing.
    
    Args:
        start_radical: Which radical number to start from (1-214)
        chunk_size: How many radicals to process in this session
    """
    print(f"🛡️  MEMORY-SAFE MODE: Processing radicals {start_radical} to {start_radical + chunk_size - 1}")
    print("=" * 60)
    
    generator = M4OptimizedRadicalGenerator()
    
    if not generator.initialize_pipeline():
        return False
    
    radicals = generator.load_all_radicals()
    if not radicals:
        print("❌ No radicals found")
        return False
    
    # Select chunk of radicals
    start_idx = start_radical - 1  # Convert to 0-based
    end_idx = min(start_idx + chunk_size, len(radicals))
    chunk_radicals = radicals[start_idx:end_idx]
    
    print(f"📊 Processing {len(chunk_radicals)} radicals in this safe chunk")
    print(f"💾 Memory limit: {generator.max_images_per_session} images")
    print()
    
    success_count = 0
    for i, radical in enumerate(chunk_radicals):
        if generator.generate_image(radical):
            success_count += 1
        
        # Small delay between each image for stability (reduced for Tiny-SD)
        if i < len(chunk_radicals) - 1:
            time.sleep(1.5)
    
    # Save chunk log
    logs_dir = Path('./logs')
    logs_dir.mkdir(exist_ok=True)
    log_file = logs_dir / f"chunk_log_{start_radical}_{int(time.time())}.txt"
    with open(log_file, 'w') as f:
        f.write(f"Safe Chunk Complete!\n")
        f.write(f"Chunk: radicals {start_radical} to {start_radical + chunk_size - 1}\n")
        f.write(f"Success: {success_count}/{len(chunk_radicals)}\n")
        f.write(f"Images saved to: {generator.output_dir}\n")
        f.write(f"Chunk time: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    print(f"✅ Chunk complete: {success_count}/{len(chunk_radicals)} images generated")
    print(f"📋 Chunk log saved to: {log_file}")
    print(f"🔄 To continue: generate_in_safe_chunks({start_radical + chunk_size})")
    return success_count > 0

def main():
    """Main function with command-line support for different models."""
    parser = argparse.ArgumentParser(
        description='M4 Optimized Radical Image Generator - Generate Japanese radical images with AI models',
        epilog='Examples:\n'
               '  %(prog)s --test                          # Test with 3 images\n'
               '  %(prog)s --model dreamlike --all         # Generate ALL 214 with Dreamlike\n'
               '  %(prog)s --model tiny-sd --all           # Generate ALL 214 with Tiny-SD\n'
               '  %(prog)s --model flux-schnell --all      # Generate ALL 214 with FLUX\n'
               '  %(prog)s --model heartsync-anime --test  # Test Anything v3.0 anime\n'
               '  %(prog)s --model dreamshaper-8 --test    # Test DreamShaper v8\n'
               '  %(prog)s --model counterfeit-v30 --test  # Test Counterfeit v3.0\n'
               '  %(prog)s --model flux-experimental --test        # Test FLUX NSFW (experimental)\n'
               '  %(prog)s --start 21 --chunk-size 5       # Generate radicals 21-25',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument('--model', '-m', type=str, default='tiny-sd',
                        choices=['tiny-sd', 'dreamlike', 'sd15', 'flux-schnell', 'flux-dev', 'watercolor', 'sketch', 'vintage', 'japanese-art', 'minimalist', 'papercut', 'photoreal', 'heartsync-anime', 'dreamshaper-8', 'counterfeit-v30', 'flux-experimental'],
                        help='Model to use: tiny-sd (default), dreamlike, sd15, flux-schnell, flux-dev, watercolor, sketch, vintage, japanese-art, minimalist, papercut, photoreal, heartsync-anime, dreamshaper-8, counterfeit-v30, flux-experimental')
    parser.add_argument('--start', '-s', type=int, default=1,
                        help='Starting radical number (default: 1)')
    parser.add_argument('--chunk-size', '-c', type=int, default=None,
                        help='Number of radicals per chunk (auto-optimized if not specified)')
    parser.add_argument('--test', '-t', action='store_true',
                        help='Run test with 3 radicals only')
    parser.add_argument('--all', '-a', action='store_true',
                        help='Generate ALL 214 radicals (runs multiple safe chunks automatically)')
    parser.add_argument('--force-reload', '-f', action='store_true',
                        help='Force clear model cache and reload (fixes corrupted downloads)')
    
    args = parser.parse_args()
    
    # Model mapping
    model_configs = {
        'tiny-sd': {
            'model_id': 'segmind/tiny-sd',
            'chunk_size': 15,
            'delay': 8,
            'description': 'Tiny-SD (fastest, most memory efficient)'
        },
        'dreamlike': {
            'model_id': 'dreamlike-art/dreamlike-anime-1.0',
            'chunk_size': 15,
            'delay': 10,
            'description': 'Dreamlike Anime (higher quality, slower)'
        },
        # 'sd15': {
        #     'model_id': 'runwayml/stable-diffusion-v1-5',
        #     'chunk_size': 15,
        #     'delay': 10,
        #     'description': 'Stable Diffusion 1.5 (balanced)'
        # },
        # 'flux-schnell': {
        #     'model_id': 'black-forest-labs/FLUX.1-schnell',
        #     'chunk_size': 1,
        #     'delay': 12,
        #     'description': 'FLUX.1-schnell (highest quality, no token required)'
        # },
        # 'flux-dev': {
        #     'model_id': 'black-forest-labs/FLUX.1-dev',
        #     'chunk_size': 1,
        #     'delay': 15,
        #     'description': 'FLUX.1-dev (best quality, requires HF_TOKEN)'
        # },
        # 'watercolor': {
        #     'model_id': 'SG161222/Realistic_Vision_V6.0_B1_noVAE',
        #     'chunk_size': 10,
        #     'delay': 10,
        #     'description': 'Realistic Vision (watercolor/painterly style)'
        # },
        'sketch': {
            'model_id': 'nitrosocke/Arcane-Diffusion',
            'chunk_size': 10,
            'delay': 9,
            'description': 'Arcane Style (hand-drawn sketch style)'
        },
        'vintage': {
            'model_id': 'wavymulder/Analog-Diffusion',
            'chunk_size': 10,
            'delay': 9,
            'description': 'Analog Style (vintage illustration)'
        },
        'japanese-art': {
            'model_id': 'hakurei/waifu-diffusion',
            'chunk_size': 10,
            'delay': 10,
            'description': 'Waifu Diffusion (anime/Japanese art style)'
        },
        'minimalist': {
            'model_id': 'stabilityai/stable-diffusion-2-1',
            'chunk_size': 10,
            'delay': 10,
            'description': 'Stable Diffusion 2.1 (clean, minimalist style)'
        },
        # 'papercut': {
        #     'model_id': 'Fictiverse/Stable_Diffusion_PaperCut_Model',
        #     'chunk_size': 10,
        #     'delay': 10,
        #     'description': 'Paper Cut Style (3D layered look)'
        # },
        # 'photoreal': {
        #     'model_id': 'dreamlike-art/dreamlike-photoreal-2.0',
        #     'chunk_size': 10,
        #     'delay': 10,
        #     'description': 'Dreamlike Photoreal (realistic style)'
        # },
        'heartsync-anime': {
            'model_id': 'Linaqruf/anything-v3.0',  # Popular uncensored anime model
            'chunk_size': 12,
            'delay': 9,
            'description': 'Anything v3.0 (uncensored anime style, versatile model)'
        },
        'dreamshaper-8': {
            'model_id': 'Lykon/dreamshaper-8',
            'chunk_size': 10,
            'delay': 10,
            'description': 'DreamShaper v8 (realistic anime style, high quality)'
        },
        'counterfeit-v30': {
            'model_id': 'gsdf/Counterfeit-V3.0',
            'chunk_size': 10,
            'delay': 10,
            'description': 'Counterfeit v3.0 (anime illustration style, detailed)'
        },
        'flux-experimental': {
            'model_id': 'Heartsync/Flux-NSFW-uncensored',
            'chunk_size': 6,
            'delay': 15,
            'description': 'FLUX.1 + NSFW LoRA (highest quality uncensored, experimental)'
        }
    }
    
    config = model_configs[args.model]
    chunk_size = args.chunk_size or config['chunk_size']
    
    print(f"🍎 M4 MacBook Pro Optimized Mode")
    print(f"🎨 Model: {config['description']}")
    if not args.all:
        print(f"🛡️  Processing {chunk_size} radicals starting from #{args.start}")
    print(f"💾 Memory optimizations: MPS watermark 70%")
    print()
    
    if args.test:
        print("🧪 Running test mode with 3 radicals...")
        generator = M4OptimizedRadicalGenerator(
            model_id=config['model_id'],
            delay_between_batches=config['delay']
        )
        if not generator.initialize_pipeline(force_reload=args.force_reload):
            return False
        generator.generate_test_images([0, 1, 2])
    elif args.all:
        print(f"🚀 FULL GENERATION MODE: All 214 radicals with {config['description']}")
        print(f"🛡️  Using safe chunks of {chunk_size} radicals each")
        print(f"⚠️  This will take a while! The script will auto-restart memory as needed.")
        print()
        
        # Create generator
        generator = M4OptimizedRadicalGenerator(
            model_id=config['model_id'],
            delay_between_batches=config['delay']
        )
        
        if not generator.initialize_pipeline(force_reload=args.force_reload):
            return False
        
        radicals = generator.load_all_radicals()
        if not radicals:
            print("❌ No radicals found")
            return False
        
        total_radicals = len(radicals)
        total_success = 0
        current_start = 1
        session_resets = 0
        
        print(f"📊 Total to generate: {total_radicals} radicals")
        print(f"📦 Chunk size: {chunk_size} radicals")
        print(f"🔄 Estimated chunks: {(total_radicals + chunk_size - 1) // chunk_size}")
        print(f"🛡️  Session limit: {generator.max_images_per_session} images (will auto-reset)")
        print()
        
        # Process all radicals in chunks
        while current_start <= total_radicals:
            current_end = min(current_start + chunk_size - 1, total_radicals)
            chunk_num = ((current_start - 1) // chunk_size) + 1
            total_chunks = (total_radicals + chunk_size - 1) // chunk_size
            
            print(f"📦 Processing chunk {chunk_num}/{total_chunks}: Radicals {current_start}-{current_end}")
            
            # Process current chunk
            start_idx = current_start - 1
            end_idx = min(start_idx + chunk_size, total_radicals)
            chunk_radicals = radicals[start_idx:end_idx]
            
            chunk_success = 0
            for i, radical in enumerate(chunk_radicals):
                # For --all mode, check if we need to reset session count
                if generator.generation_count >= generator.max_images_per_session:
                    session_resets += 1
                    print(f"🔄 Session limit reached ({generator.max_images_per_session} images), resetting for memory safety...")
                    print(f"📊 Starting session #{session_resets + 1} after {total_success} total images")
                    generator._force_memory_cleanup()
                    generator.generation_count = 0  # Reset session counter
                    time.sleep(5)  # Extra pause for memory stability
                    print(f"✅ Session reset complete, continuing generation...")
                
                if generator.generate_image(radical):
                    chunk_success += 1
                    total_success += 1
                
                # Brief pause between images
                if i < len(chunk_radicals) - 1:
                    time.sleep(1.5)
            
            print(f"✅ Chunk {chunk_num} complete: {chunk_success}/{len(chunk_radicals)} images")
            print(f"📊 Total progress: {total_success}/{total_radicals} ({100*total_success/total_radicals:.1f}%)")
            
            # Move to next chunk
            current_start += chunk_size
            
            # Extended break between chunks for memory stability
            if current_start <= total_radicals:
                print(f"⏳ Memory stability break between chunks...")
                generator._force_memory_cleanup()
                time.sleep(config['delay'])
                print()
        
        print("🎉 ALL RADICALS COMPLETE!")
        print(f"✅ Successfully generated: {total_success}/{total_radicals} images")
        print(f"🔄 Total memory sessions: {session_resets + 1}")
        print(f"📁 Images saved to: {generator.output_dir}")
        return total_success > 0
    else:
        print(f"🚀 Generating radicals {args.start} to {args.start + chunk_size - 1}")
        
        # Create generator with specified model
        generator = M4OptimizedRadicalGenerator(
            model_id=config['model_id'],
            delay_between_batches=config['delay']
        )
        
        if not generator.initialize_pipeline(force_reload=args.force_reload):
            return False
        
        radicals = generator.load_all_radicals()
        if not radicals:
            print("❌ No radicals found")
            return False
        
        # Process the specified chunk
        start_idx = args.start - 1
        end_idx = min(start_idx + chunk_size, len(radicals))
        chunk_radicals = radicals[start_idx:end_idx]
        
        success_count = 0
        for i, radical in enumerate(chunk_radicals):
            if generator.generate_image(radical):
                success_count += 1
            
            if i < len(chunk_radicals) - 1:
                time.sleep(1.5)
        
        print(f"✅ Complete: {success_count}/{len(chunk_radicals)} images generated")
        print(f"🔄 Next chunk: python generate_radical_images_m4_optimized.py --model {args.model} --start {args.start + chunk_size}")
        return success_count > 0

def test_memory_optimization():
    """Quick test to verify memory optimizations work - generates only 1 image."""
    print("🧪 Testing M4 memory optimizations with single image generation")
    print("=" * 60)
    
    generator = M4OptimizedRadicalGenerator()
    
    if not generator.initialize_pipeline():
        print("❌ Pipeline initialization failed")
        return False
    
    radicals = generator.load_all_radicals()
    if not radicals:
        print("❌ No radicals found")
        return False
    
    # Test with just the first radical
    test_radical = radicals[0]
    print(f"🎯 Testing with radical {test_radical.get('number', 1)}")
    
    success = generator.generate_image(test_radical)
    
    if success:
        print("✅ Memory optimization test PASSED!")
        print("💡 You can now run main() or generate_in_safe_chunks() for full generation")
    else:
        print("❌ Memory optimization test FAILED!")
        print("💡 Try restarting Python and closing other applications")
    
    return success

if __name__ == "__main__":
    # Uncomment the line below to run a single image test first
    # test_memory_optimization()
    main() 
