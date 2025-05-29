#!/usr/bin/env node

console.log('\n🔄 Next.js Environment Variable Check\n');
console.log('This script will help diagnose if Next.js needs to be restarted.\n');

// Load .env.local directly
require('dotenv').config({ path: '.env.local' });

const directKey = process.env.STRIPE_SECRET_KEY;
console.log('✅ Direct .env.local load:');
console.log(`   Key length: ${directKey ? directKey.length : 0} characters`);
console.log(`   Key preview: ${directKey ? directKey.substring(0, 20) + '...' + directKey.substring(directKey.length - 10) : 'Not found'}`);

console.log('\n💡 If the key length is 107 characters here but only 32 in the API,');
console.log('   you need to restart your Next.js server for the changes to take effect.');
console.log('\n🔄 To restart Next.js:');
console.log('   1. Press Ctrl+C to stop the current server');
console.log('   2. Run: npm run dev');
console.log('\n📝 Note: Next.js only loads environment variables at startup.');
console.log('   Changes to .env.local require a server restart.');