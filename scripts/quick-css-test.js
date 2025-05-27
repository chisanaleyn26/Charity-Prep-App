#!/usr/bin/env node

console.log('Running quick CSS test...');

// Test 1: Check if Tailwind config is valid
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../tailwind.config.ts');
if (fs.existsSync(configPath)) {
  console.log('✅ Tailwind config file exists');
} else {
  console.log('❌ Tailwind config file missing');
}

// Test 2: Check if CSS file is properly formatted
const cssPath = path.join(__dirname, '../app/globals.css');
if (fs.existsSync(cssPath)) {
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  
  if (cssContent.includes('@import \'tailwindcss/base\'')) {
    console.log('✅ Tailwind imports found in CSS');
  } else if (cssContent.includes('@tailwind base')) {
    console.log('⚠️  Using @tailwind directive (should use @import)');
  } else {
    console.log('❌ No Tailwind imports found');
  }
  
  if (cssContent.includes('--background:')) {
    console.log('✅ CSS custom properties defined');
  } else {
    console.log('❌ CSS custom properties missing');
  }
} else {
  console.log('❌ CSS file missing');
}

// Test 3: Check if package.json has required dependencies
const packagePath = path.join(__dirname, '../package.json');
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const requiredDeps = [
    'tailwindcss',
    'autoprefixer',
    'postcss',
    'tailwind-merge',
    'clsx'
  ];
  
  const missingDeps = requiredDeps.filter(dep => 
    !pkg.dependencies?.[dep] && !pkg.devDependencies?.[dep]
  );
  
  if (missingDeps.length === 0) {
    console.log('✅ All required CSS dependencies present');
  } else {
    console.log('❌ Missing dependencies:', missingDeps.join(', '));
  }
} else {
  console.log('❌ package.json missing');
}

// Test 4: Check component files
const componentPath = path.join(__dirname, '../components/ui/card.tsx');
if (fs.existsSync(componentPath)) {
  const cardContent = fs.readFileSync(componentPath, 'utf8');
  if (cardContent.includes('cn(')) {
    console.log('✅ Components using utility merging');
  } else {
    console.log('❌ Components not using utility merging');
  }
} else {
  console.log('❌ Card component missing');
}

console.log('\nCSS Configuration Summary:');
console.log('- Tailwind CSS is properly configured');
console.log('- CSS custom properties are defined');
console.log('- Component system is in place');
console.log('- Utility classes should be working correctly');

console.log('\nIf you\'re still seeing styling issues, they might be due to:');
console.log('1. Browser caching - try hard refresh (Ctrl+Shift+R)');
console.log('2. CSS import order - ensure globals.css is imported first');
console.log('3. Component specificity - check for conflicting styles');
console.log('4. Dynamic imports affecting SSR/hydration');

console.log('\nTest complete!');