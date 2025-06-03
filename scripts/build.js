const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Create build directory
const buildDir = path.join(__dirname, "..", "build");
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
}

// Files and directories to include in the extension
const includePatterns = [
  "manifest.json",
  "*.js",
  "*.html",
  "*.css",
  "icons/**/*"
];

// Files and directories to exclude
const excludePatterns = [
  "node_modules",
  "test",
  ".github",
  "*.md",
  "package*.json",
  ".eslintrc.js",
  "jest.*.js",
  "scripts",
  "build",
  ".git",
  ".gitignore",
  ".DS_Store",
  "coverage"
];

// Convert patterns to zip arguments
const includeArgs = includePatterns.map(p => p).join(" ");
const excludeArgs = excludePatterns.map(p => `-x "${p}" -x "${p}/*"`).join(" ");

// Create zip file
const zipPath = path.join(buildDir, "relaxblock.zip");
const zipCommand = `zip -r "${zipPath}" . ${excludeArgs}`;

console.log("Building RelaxBlock extension...");
console.log("Creating zip file...");

try {
  execSync(zipCommand, { stdio: "inherit" });
  
  // Get file size
  const stats = fs.statSync(zipPath);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log(`\n✅ Build complete!`);
  console.log(`📦 Extension package: ${zipPath}`);
  console.log(`📏 Size: ${fileSizeInMB} MB`);
  
  // Verify the zip contains expected files
  console.log("\n📋 Package contents:");
  execSync(`unzip -l "${zipPath}" | grep -E "(manifest.json|popup.html|background.js|content.js|options.html|icon_128.png)" | head -10`, { stdio: "inherit" });
  
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}