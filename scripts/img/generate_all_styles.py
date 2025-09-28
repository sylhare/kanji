#!/usr/bin/env python3
"""
Multi-Style Radical Generator
Generate Japanese radical images using all available artistic models.

This script automatically tries all models and skips those that fail,
ensuring you get samples from every working artistic style.
"""

import subprocess
import sys
import time
import argparse
from pathlib import Path
import json
from datetime import datetime
import signal
import threading

class MultiStyleGenerator:
    def __init__(self, test_mode=False, target_radicals=None):
        """
        Initialize multi-style generator.
        
        Args:
            test_mode: If True, generate only test images (3 radicals)
            target_radicals: List of specific radical numbers to generate
        """
        self.test_mode = test_mode
        self.target_radicals = target_radicals or [1, 2, 3] if test_mode else None
        
        # All available models with their characteristics
        self.models = {
            'tiny-sd': {
                'description': 'Tiny-SD (fastest, most memory efficient)',
                'expected_time': '2-3 hours',
                'style': 'Simple digital art'
            },
            'dreamlike': {
                'description': 'Dreamlike Anime (higher quality, slower)',
                'expected_time': '4-5 hours',
                'style': 'Anime/cartoon style'
            },
            # 'sd15': {
            #     'description': 'Stable Diffusion 1.5 (balanced)',
            #     'expected_time': '3-4 hours',
            #     'style': 'Standard digital art'
            # },
            # 'watercolor': {
            #     'description': 'Realistic Vision (watercolor/painterly style)',
            #     'expected_time': '4-5 hours',
            #     'style': 'Watercolor painting'
            # },
            'sketch': {
                'description': 'Arcane Style (hand-drawn sketch style)',
                'expected_time': '3-4 hours',
                'style': 'Hand-drawn sketches'
            },
            'vintage': {
                'description': 'Analog Style (vintage illustration)',
                'expected_time': '3-4 hours',
                'style': 'Vintage illustrations'
            },
            'japanese-art': {
                'description': 'Waifu Diffusion (anime/Japanese art style)',
                'expected_time': '4-5 hours',
                'style': 'Traditional Japanese art'
            },
            'minimalist': {
                'description': 'Stable Diffusion 2.1 (clean, minimalist style)',
                'expected_time': '3-4 hours',
                'style': 'Clean minimalist lines'
            },
            # 'papercut': {
            #     'description': 'Paper Cut Style (3D layered look)',
            #     'expected_time': '4-5 hours',
            #     'style': '3D paper cut art'
            # },
            # 'photoreal': {
            #     'description': 'Dreamlike Photoreal (realistic style)',
            #     'expected_time': '4-5 hours',
            #     'style': 'Photorealistic'
            # },
            'heartsync-anime': {
                'description': 'Anything v3.0 (uncensored anime style, versatile model)',
                'expected_time': '3-4 hours',
                'style': 'Anime/cartoon style'
            },
            'dreamshaper-8': {
                'description': 'DreamShaper v8 (realistic anime style, high quality)',
                'expected_time': '4-5 hours',
                'style': 'Realistic anime style'
            },
            'counterfeit-v30': {
                'description': 'Counterfeit v3.0 (anime illustration style, detailed)',
                'expected_time': '4-5 hours',
                'style': 'Anime illustration style'
            },
            'flux-experimental': {
                'description': 'FLUX.1 + NSFW LoRA (highest quality uncensored, experimental)',
                'expected_time': '6-8 hours',
                'style': 'Ultra high quality uncensored'
            }
            # 'flux-schnell': {
            #     'description': 'FLUX.1-schnell (highest quality, no token required)',
            #     'expected_time': '6-8 hours',
            #     'style': 'Ultra high quality'
            # },
            # 'flux-dev': {
            #     'description': 'FLUX.1-dev (best quality, requires HF_TOKEN)',
            #     'expected_time': '8-10 hours',
            #     'style': 'Best possible quality'
            # }
        }
        
        self.results = {
            'successful_models': [],
            'failed_models': [],
            'skipped_models': [],
            'start_time': datetime.now(),
            'end_time': None
        }
        
        # Create results directory - place it in the parent directory to match original location
        self.results_dir = Path("../../multi_style_results")
        self.results_dir.mkdir(exist_ok=True)
        
        print(f"🎨 Multi-Style Radical Generator")
        print(f"📊 Models to test: {len(self.models)}")
        if self.test_mode:
            print(f"🧪 Test mode: {len(self.target_radicals)} radicals per model")
        else:
            print(f"🚀 Full mode: All 214 radicals per model")
        print(f"📁 Results directory: {self.results_dir}")
        print()
    
    def check_requirements(self):
        """Check if the base script exists and is executable."""
        # Script is now in the same directory (scripts/img/)
        base_script = Path("generate_radical_images.py")
        if not base_script.exists():
            print(f"❌ Required script not found: {base_script}")
            return False
        
        print(f"✅ Base script found: {base_script}")
        return True
    
    def generate_with_model(self, model_name):
        """
        Generate images with a specific model.
        
        Args:
            model_name: Name of the model to use
            
        Returns:
            dict: Generation results with success status and output info
        """
        model_info = self.models[model_name]
        print(f"\n🎨 Starting generation with: {model_name}")
        print(f"   Style: {model_info['style']}")
        print(f"   Expected time: {model_info['expected_time']}")
        print("=" * 60)
        
        try:
            # Build command - script is now in the same directory
            cmd = [
                sys.executable, 
                "generate_radical_images.py", 
                "--model", model_name
            ]
            
            if self.test_mode:
                cmd.append("--test")
            else:
                cmd.append("--all")
            
            # Run the generation with LIVE OUTPUT
            print(f"🚀 Executing: {' '.join(cmd)}")
            print(f"⏰ Timeout: {'2 hours' if self.test_mode else '8 hours'}")
            print(f"📺 Live output from {model_name}:")
            print("=" * 60)
            
            # Create log file for backup
            log_file = self.results_dir / f"{model_name}_output.log"
            
            try:
                # Run with REAL-TIME live output AND logging
                with open(log_file, 'w') as log_f:
                    log_f.write(f"Command: {' '.join(cmd)}\n")
                    log_f.write(f"Started: {datetime.now()}\n")
                    log_f.write("=" * 50 + "\n")
                    log_f.flush()
                    
                    # Use Popen for real-time output streaming
                    process = subprocess.Popen(
                        cmd,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.STDOUT,  # Merge stderr into stdout
                        text=True,
                        bufsize=1,  # Line buffered
                        universal_newlines=True,
                        cwd="../.."  # Change working directory to project root from scripts/img/
                    )
                    
                    output_lines = []
                    
                    # Stream output in real-time
                    def timeout_handler():
                        process.kill()
                    
                    timeout_seconds = 7200 if self.test_mode else 28800  # 2h for test, 8h for full
                    timer = threading.Timer(timeout_seconds, timeout_handler)
                    timer.start()
                    
                    try:
                        # Read output line by line in real-time
                        for line in process.stdout:
                            print(line, end='')  # Print immediately to screen
                            log_f.write(line)    # Write to log file
                            log_f.flush()        # Ensure it's written immediately
                            output_lines.append(line)
                        
                        # Wait for process to complete
                        return_code = process.wait()
                        timer.cancel()  # Cancel timeout timer
                        
                    except Exception as e:
                        timer.cancel()
                        process.kill()
                        raise e
                    
                    log_f.write(f"\nCompleted: {datetime.now()}\n")
                    log_f.write(f"Return code: {return_code}\n")
                    
                    # Create result object
                    result = type('Result', (), {
                        'returncode': return_code, 
                        'stdout': ''.join(output_lines), 
                        'stderr': ''
                    })()
                    
            except Exception as e:
                print(f"❌ Error running {model_name}: {e}")
                with open(log_file, 'a') as log_f:
                    log_f.write(f"\nERROR: {e}\n")
                result = type('Result', (), {'returncode': -2, 'stdout': '', 'stderr': str(e)})()
            
            print("=" * 60)
            
            success = result.returncode == 0
            
            # Extract output directory from stdout if successful
            output_dir = None
            if success and "Output directory:" in result.stdout:
                for line in result.stdout.split('\n'):
                    if "Output directory:" in line:
                        output_dir = line.split("Output directory:")[-1].strip()
                        break
            
            generation_result = {
                'model': model_name,
                'success': success,
                'output_dir': output_dir,
                'log_file': str(log_file),
                'return_code': result.returncode,
                'description': model_info['description'],
                'style': model_info['style']
            }
            
            if success:
                print(f"✅ {model_name} completed successfully!")
                if output_dir:
                    print(f"📁 Images saved to: {output_dir}")
                self.results['successful_models'].append(generation_result)
            else:
                print(f"❌ {model_name} failed with return code {result.returncode}")
                print(f"📋 Error details saved to: {log_file}")
                self.results['failed_models'].append(generation_result)
            
            return generation_result
            
        except subprocess.TimeoutExpired:
            print(f"⏰ {model_name} timed out - skipping to next model")
            timeout_result = {
                'model': model_name,
                'success': False,
                'error': 'timeout',
                'description': model_info['description'],
                'style': model_info['style']
            }
            self.results['failed_models'].append(timeout_result)
            return timeout_result
            
        except Exception as e:
            print(f"❌ Unexpected error with {model_name}: {e}")
            error_result = {
                'model': model_name,
                'success': False,
                'error': str(e),
                'description': model_info['description'],
                'style': model_info['style']
            }
            self.results['failed_models'].append(error_result)
            return error_result
    
    def should_skip_model(self, model_name):
        """Check if a model should be skipped based on requirements."""
        if model_name == 'flux-dev':
            # Check for HF_TOKEN
            import os
            if not os.getenv('HF_TOKEN'):
                print(f"⚠️  Skipping {model_name}: Requires HF_TOKEN environment variable")
                skip_result = {
                    'model': model_name,
                    'reason': 'Missing HF_TOKEN',
                    'description': self.models[model_name]['description']
                }
                self.results['skipped_models'].append(skip_result)
                return True
        
        return False
    
    def generate_all_styles(self):
        """Generate images with all available models."""
        if not self.check_requirements():
            return False
        
        print(f"🚀 Starting multi-style generation...")
        print(f"⏰ Start time: {self.results['start_time'].strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        total_models = len(self.models)
        current_model = 0
        
        try:
            for model_name in self.models.keys():
                current_model += 1
                print(f"\n📦 Model {current_model}/{total_models}: {model_name}")
                
                try:
                    # Check if model should be skipped
                    if self.should_skip_model(model_name):
                        continue
                    
                    # Generate with this model - always continue to next on any error
                    self.generate_with_model(model_name)
                    
                except KeyboardInterrupt:
                    print(f"\n⚠️  User interrupted during {model_name}")
                    print(f"🔄 Continuing to next model...")
                    continue
                    
                except Exception as e:
                    print(f"❌ Unexpected error with {model_name}: {e}")
                    print(f"🔄 Continuing to next model...")
                    error_result = {
                        'model': model_name,
                        'success': False,
                        'error': f'Unexpected error: {str(e)}',
                        'description': self.models[model_name]['description'],
                        'style': self.models[model_name]['style']
                    }
                    self.results['failed_models'].append(error_result)
                    continue
                
                # Brief pause between models for system stability
                if current_model < total_models:
                    print(f"⏳ Brief pause before next model...")
                    time.sleep(10)
        
        except KeyboardInterrupt:
            print(f"\n🛑 Generation stopped by user")
            print(f"📊 Processed {current_model}/{total_models} models")
        
        except Exception as e:
            print(f"\n❌ Critical error in main loop: {e}")
            print(f"📊 Processed {current_model}/{total_models} models before error")
        
        finally:
            self.results['end_time'] = datetime.now()
            self.save_final_report()
        
        return len(self.results['successful_models']) > 0
    
    def save_final_report(self):
        """Save comprehensive results report."""
        duration = self.results['end_time'] - self.results['start_time']
        
        # Create summary report
        report = {
            'generation_summary': {
                'start_time': self.results['start_time'].isoformat(),
                'end_time': self.results['end_time'].isoformat(),
                'total_duration': str(duration),
                'test_mode': self.test_mode,
                'total_models_attempted': len(self.models),
                'successful_models': len(self.results['successful_models']),
                'failed_models': len(self.results['failed_models']),
                'skipped_models': len(self.results['skipped_models'])
            },
            'results': self.results
        }
        
        # Save JSON report
        json_file = self.results_dir / f"generation_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(json_file, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        # Create human-readable summary
        summary_file = self.results_dir / "SUMMARY.md"
        with open(summary_file, 'w') as f:
            f.write(f"# Multi-Style Radical Generation Results\n\n")
            f.write(f"**Generated:** {self.results['end_time'].strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"**Duration:** {duration}\n")
            f.write(f"**Mode:** {'Test (3 radicals)' if self.test_mode else 'Full (214 radicals)'}\n\n")
            
            f.write(f"## Summary\n")
            f.write(f"- ✅ **Successful:** {len(self.results['successful_models'])} models\n")
            f.write(f"- ❌ **Failed:** {len(self.results['failed_models'])} models\n")
            f.write(f"- ⚠️  **Skipped:** {len(self.results['skipped_models'])} models\n\n")
            
            if self.results['successful_models']:
                f.write(f"## ✅ Successful Models\n\n")
                for result in self.results['successful_models']:
                    f.write(f"### {result['model']}\n")
                    f.write(f"- **Style:** {result['style']}\n")
                    f.write(f"- **Description:** {result['description']}\n")
                    if result.get('output_dir'):
                        f.write(f"- **Images:** `{result['output_dir']}`\n")
                    f.write(f"\n")
            
            if self.results['failed_models']:
                f.write(f"## ❌ Failed Models\n\n")
                for result in self.results['failed_models']:
                    f.write(f"### {result['model']}\n")
                    f.write(f"- **Style:** {result['style']}\n")
                    f.write(f"- **Error:** {result.get('error', 'Generation failed')}\n")
                    if result.get('log_file'):
                        f.write(f"- **Log:** `{result['log_file']}`\n")
                    f.write(f"\n")
            
            if self.results['skipped_models']:
                f.write(f"## ⚠️ Skipped Models\n\n")
                for result in self.results['skipped_models']:
                    f.write(f"### {result['model']}\n")
                    f.write(f"- **Reason:** {result['reason']}\n")
                    f.write(f"- **Description:** {result['description']}\n")
                    f.write(f"\n")
        
        print(f"\n🎉 Multi-style generation complete!")
        print(f"⏰ Total duration: {duration}")
        print(f"✅ Successful models: {len(self.results['successful_models'])}")
        print(f"❌ Failed models: {len(self.results['failed_models'])}")
        print(f"⚠️  Skipped models: {len(self.results['skipped_models'])}")
        print(f"📋 Full report: {json_file}")
        print(f"📝 Summary: {summary_file}")
        
        if self.results['successful_models']:
            print(f"\n🎨 Successful styles generated:")
            for result in self.results['successful_models']:
                print(f"   - {result['model']}: {result['style']}")
                if result.get('output_dir'):
                    print(f"     📁 {result['output_dir']}")

def main():
    """Main function with command-line support."""
    parser = argparse.ArgumentParser(
        description='Multi-Style Radical Generator - Test all artistic models',
        epilog='Examples:\n'
               '  %(prog)s --test           # Test all models with 3 radicals each\n'
               '  %(prog)s --full           # Generate all 214 radicals with all models\n'
               '  %(prog)s --models tiny-sd dreamlike  # Test specific models only',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument('--test', '-t', action='store_true',
                        help='Test mode: generate 3 radicals with each model')
    parser.add_argument('--full', '-f', action='store_true',
                        help='Full mode: generate all 214 radicals with each model')
    parser.add_argument('--models', '-m', nargs='+',
                        help='Test specific models only (space-separated list)')
    
    args = parser.parse_args()
    
    if not args.test and not args.full and not args.models:
        print("❌ Please specify --test, --full, or --models")
        parser.print_help()
        return False
    
    if args.test and args.full:
        print("❌ Cannot use both --test and --full")
        return False
    
    # Determine mode
    test_mode = args.test or bool(args.models)
    
    # Create generator
    generator = MultiStyleGenerator(test_mode=test_mode)
    
    # Filter models if specific ones requested
    if args.models:
        available_models = set(generator.models.keys())
        requested_models = set(args.models)
        invalid_models = requested_models - available_models
        
        if invalid_models:
            print(f"❌ Invalid models: {invalid_models}")
            print(f"📋 Available models: {sorted(available_models)}")
            return False
        
        # Filter to requested models only
        generator.models = {k: v for k, v in generator.models.items() if k in requested_models}
        print(f"🎯 Testing specific models: {sorted(requested_models)}")
    
    # Warn about time commitment for full mode
    if args.full:
        estimated_time = len(generator.models) * 5  # ~5 hours average per model
        print(f"⚠️  FULL MODE WARNING:")
        print(f"   - This will generate 214 radicals × {len(generator.models)} models")
        print(f"   - Estimated time: ~{estimated_time} hours")
        print(f"   - Models will run sequentially, skipping failures")
        print(f"   - You can stop anytime with Ctrl+C")
        
        response = input(f"\n🤔 Continue with full generation? (y/N): ")
        if response.lower() != 'y':
            print("🛑 Generation cancelled")
            return False
    
    # Start generation
    return generator.generate_all_styles()

if __name__ == "__main__":
    main()
