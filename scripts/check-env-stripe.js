#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse for STRIPE_SECRET_KEY
const lines = envContent.split('\n');
const stripeLine = lines.find(line => line.startsWith('STRIPE_SECRET_KEY'));

if (!stripeLine) {
  console.error('❌ STRIPE_SECRET_KEY not found in .env.local');
  process.exit(1);
}

console.log('🔍 Analyzing STRIPE_SECRET_KEY in .env.local:\n');

// Extract the key value
const keyMatch = stripeLine.match(/STRIPE_SECRET_KEY=(.+)/);
if (!keyMatch) {
  console.error('❌ Invalid format for STRIPE_SECRET_KEY line');
  process.exit(1);
}

const keyValue = keyMatch[1];

// Check for common issues
console.log('📋 Key Analysis:');
console.log(`   Line: "${stripeLine}"`);
console.log(`   Key starts with: ${keyValue.substring(0, 10)}...`);
console.log(`   Key length: ${keyValue.length} characters`);
console.log(`   Has quotes: ${(keyValue.startsWith('"') || keyValue.startsWith("'")) ? 'Yes ⚠️' : 'No ✅'}`);
console.log(`   Has spaces: ${keyValue.includes(' ') ? 'Yes ⚠️' : 'No ✅'}`);
console.log(`   Has trailing whitespace: ${keyValue !== keyValue.trim() ? 'Yes ⚠️' : 'No ✅'}`);
console.log(`   Starts with sk_test_: ${keyValue.startsWith('sk_test_') ? 'Yes ✅' : 'No ❌'}`);

// Check for hidden characters
const hiddenChars = [];
for (let i = 0; i < keyValue.length; i++) {
  const charCode = keyValue.charCodeAt(i);
  if (charCode < 32 || charCode > 126) {
    hiddenChars.push({ position: i, charCode });
  }
}

if (hiddenChars.length > 0) {
  console.log(`   Hidden characters: Yes ⚠️ (${hiddenChars.length} found)`);
  hiddenChars.forEach(({ position, charCode }) => {
    console.log(`      - Position ${position}: char code ${charCode}`);
  });
} else {
  console.log(`   Hidden characters: No ✅`);
}

// Check if the key is properly formatted
if (keyValue.startsWith('"') || keyValue.startsWith("'")) {
  console.log('\n⚠️  WARNING: Your key appears to have quotes around it.');
  console.log('   Remove the quotes from the .env.local file.');
  console.log('   It should be: STRIPE_SECRET_KEY=sk_test_...');
  console.log('   NOT: STRIPE_SECRET_KEY="sk_test_..."');
}

if (keyValue.includes(' ')) {
  console.log('\n⚠️  WARNING: Your key contains spaces.');
  console.log('   Make sure to copy the key without any spaces.');
}

if (keyValue !== keyValue.trim()) {
  console.log('\n⚠️  WARNING: Your key has trailing whitespace.');
  console.log('   Make sure there are no spaces or tabs after the key.');
}

console.log('\n💡 The key in .env.local should look like:');
console.log('   STRIPE_SECRET_KEY=sk_test_51234567890abcdef...');
console.log('   (no quotes, no spaces, no extra characters)');