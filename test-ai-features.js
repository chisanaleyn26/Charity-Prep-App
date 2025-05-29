// Test script to check AI features
console.log('Testing AI Features...\n');

// Check environment
console.log('1. Environment Check:');
console.log('- OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? 'Set ✓' : 'Missing ✗');
console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set ✓' : 'Missing ✗');
console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set ✓' : 'Missing ✗');

// Check AI service files
const fs = require('fs');
const path = require('path');

console.log('\n2. AI Service Files:');
const aiFiles = [
  '/lib/ai/openrouter.ts',
  '/features/ai/services/email-processor.ts',
  '/features/ai/services/document-ocr.ts',
  '/features/ai/services/search-parser.ts',
  '/features/ai/services/search-executor.ts',
  '/features/ai/services/report-narrator.ts',
  '/features/ai/services/compliance-chat.ts'
];

aiFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`- ${file}:`, exists ? 'Exists ✓' : 'Missing ✗');
});

console.log('\n3. AI Component Files:');
const aiComponents = [
  '/features/ai/components/import-queue.tsx',
  '/features/ai/components/extraction-review.tsx',
  '/features/ai/components/smart-search.tsx',
  '/features/ai/components/report-generator.tsx',
  '/features/ai/components/compliance-chat.tsx'
];

aiComponents.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`- ${file}:`, exists ? 'Exists ✓' : 'Missing ✗');
});

console.log('\n4. AI Route Files:');
const aiRoutes = [
  '/app/api/webhooks/email/route.ts',
  '/app/(app)/search/page.tsx',
  '/app/(app)/reports/ai/page.tsx',
  '/app/(app)/compliance/chat/page.tsx'
];

aiRoutes.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`- ${file}:`, exists ? 'Exists ✓' : 'Missing ✗');
});