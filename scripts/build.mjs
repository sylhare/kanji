import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const buildOptions = {
  entryPoints: ['assets/js/modules/main.js'], // We'll create this entry point
  bundle: true,
  minify: true,
  format: 'iife', // Immediately Invoked Function Expression for browser
  target: 'es2017',
  outfile: 'assets/js/main.min.js',
  globalName: 'KanjiApp',
  sourcemap: true,
  define: {
    'process.env.NODE_ENV': '"production"'
  }
};

async function buildMain() {
  try {
    console.log('🔨 Building JavaScript bundle...');
    await build(buildOptions);
    console.log('✅ JavaScript bundle built successfully!');
    
    // Update sourcemap reference in the minified file
    const minifiedContent = readFileSync('assets/js/main.min.js', 'utf8');
    const updatedContent = minifiedContent + '\n//# sourceMappingURL=main.min.js.map\n';
    writeFileSync('assets/js/main.min.js', updatedContent);
    
    console.log('📦 Output: assets/js/main.min.js');
    console.log('🗺️  Sourcemap: assets/js/main.min.js.map');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildMain();

