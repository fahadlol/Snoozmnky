const fs = require('fs');
const path = require('path');

// Cross-platform file copying script
function copyFile(src, dest) {
  try {
    // Ensure destination directory exists
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Copy the file
    fs.copyFileSync(src, dest);
    console.log(`✓ Copied ${src} to ${dest}`);
  } catch (error) {
    console.error(`✗ Failed to copy ${src} to ${dest}:`, error.message);
    process.exit(1);
  }
}

// Copy config.js and app.js to dist/
copyFile('config.js', 'dist/config.js');
copyFile('app.js', 'dist/app.js');

console.log('✓ Build files copied successfully');

