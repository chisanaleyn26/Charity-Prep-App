# Charity Prep - Testing Strategy

## Overview

Simple, pragmatic testing that doesn't slow down our 5-day build:

- **Unit Tests**: Business logic and utilities (Jest)
- **Integration Tests**: API routes and database operations (Jest + Supabase)
- **E2E Tests**: Critical user paths (Playwright)
- **Skip**: Testing UI components, external APIs, generated code

### When to Write Tests

**ALWAYS test:**

- Business logic (compliance calculations, date logic)
- Data transformations (CSV parsing, report generation)
- API endpoints (especially auth-protected routes)
- Critical user journeys (signup → first value)

**SKIP testing:**

- Shadcn UI components (already tested)
- Simple CRUD without logic
- Third-party integrations (mock instead)
- Generated TypeScript types

## Testing Setup

### Installation

```bash
# Jest for unit/integration tests
npm install --save-dev jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom

# Playwright for E2E
npm install --save-dev @playwright/test

# Supabase test helpers
npm install --save-dev @supabase/supabase-js

```

### Configuration Files

### `jest.config.js`

```jsx
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/components/ui/', // Skip Shadcn components
  ],
};

```

### `playwright.config.ts`

```tsx
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
});

```

## Unit Testing

### What to Unit Test

Business logic, calculations, and data transformations.

### Example: Compliance Score Calculation

```tsx
// lib/compliance/__tests__/score-calculator.test.ts

import { calculateComplianceScore } from '../score-calculator';

describe('calculateComplianceScore', () => {
  it('calculates 100% when all modules complete', () => {
    const data = {
      safeguarding: { complete: 10, total: 10 },
      overseas: { complete: 5, total: 5 },
      fundraising: { complete: 8, total: 8 },
    };

    expect(calculateComplianceScore(data)).toBe(100);
  });

  it('weights modules correctly (40% safeguarding, 30% overseas, 30% fundraising)', () => {
    const data = {
      safeguarding: { complete: 10, total: 10 }, // 100% * 0.4 = 40
      overseas: { complete: 0, total: 5 },        // 0% * 0.3 = 0
      fundraising: { complete: 4, total: 8 },     // 50% * 0.3 = 15
    };

    expect(calculateComplianceScore(data)).toBe(55);
  });

  it('handles empty data gracefully', () => {
    const data = {
      safeguarding: { complete: 0, total: 0 },
      overseas: { complete: 0, total: 0 },
      fundraising: { complete: 0, total: 0 },
    };

    expect(calculateComplianceScore(data)).toBe(0);
  });
});

```

### Example: DBS Expiry Logic

```tsx
// features/compliance/safeguarding/__tests__/dbs-utils.test.ts

import { getDaysUntilExpiry, getExpiryStatus } from '../dbs-utils';

describe('DBS Expiry Utils', () => {
  beforeEach(() => {
    // Fix "today" for consistent tests
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-15'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getDaysUntilExpiry', () => {
    it('calculates days correctly', () => {
      expect(getDaysUntilExpiry('2025-02-14')).toBe(30);
      expect(getDaysUntilExpiry('2025-01-20')).toBe(5);
      expect(getDaysUntilExpiry('2025-01-10')).toBe(-5);
    });
  });

  describe('getExpiryStatus', () => {
    it('returns correct status based on days remaining', () => {
      expect(getExpiryStatus(100)).toBe('valid');
      expect(getExpiryStatus(60)).toBe('expiring-soon');
      expect(getExpiryStatus(25)).toBe('urgent');
      expect(getExpiryStatus(-1)).toBe('expired');
    });
  });
});

```

### Testing Utilities Pattern

```tsx
// tests/utils/test-factories.ts

export const createMockDBS = (overrides = {}) => ({
  id: '123',
  person_name: 'John Smith',
  dbs_number: '123456789012',
  issue_date: '2024-01-15',
  expiry_date: '2025-01-15',
  ...overrides,
});

export const createMockOrganization = (overrides = {}) => ({
  id: '456',
  name: 'Test Charity',
  charity_number: '1234567',
  year_end: '2025-03-31',
  ...overrides,
});

```

## Integration Testing

### What to Integration Test

API routes with database operations and authentication.

### Example: API Route Testing

```tsx
// app/api/compliance/safeguarding/__tests__/route.test.ts

import { createClient } from '@supabase/supabase-js';
import { POST, GET } from '../route';

// Mock Supabase
jest.mock('@supabase/supabase-js');

describe('Safeguarding API', () => {
  let mockSupabase;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: [createMockDBS()],
            error: null,
          })),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: createMockDBS(),
              error: null,
            })),
          })),
        })),
      })),
    };

    createClient.mockReturnValue(mockSupabase);
  });

  describe('GET /api/compliance/safeguarding', () => {
    it('returns safeguarding records for organization', async () => {
      const request = new Request('http://localhost/api/compliance/safeguarding', {
        headers: {
          'organization-id': '456',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].person_name).toBe('John Smith');
    });

    it('returns 401 without organization header', async () => {
      const request = new Request('http://localhost/api/compliance/safeguarding');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/compliance/safeguarding', () => {
    it('creates new DBS record', async () => {
      const request = new Request('http://localhost/api/compliance/safeguarding', {
        method: 'POST',
        headers: {
          'organization-id': '456',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          person_name: 'Jane Doe',
          dbs_number: '987654321098',
          issue_date: '2025-01-01',
          expiry_date: '2026-01-01',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(mockSupabase.from).toHaveBeenCalledWith('safeguarding_records');
    });

    it('validates DBS number format', async () => {
      const request = new Request('http://localhost/api/compliance/safeguarding', {
        method: 'POST',
        headers: {
          'organization-id': '456',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          person_name: 'Jane Doe',
          dbs_number: 'invalid',
          issue_date: '2025-01-01',
          expiry_date: '2026-01-01',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });
});

```

### Example: Database Operations

```tsx
// lib/db/__tests__/safeguarding-queries.test.ts

import { createTestClient, seedTestData, cleanupTestData } from '@/tests/utils/test-db';
import { getSafeguardingRecords, createSafeguardingRecord } from '../safeguarding-queries';

describe('Safeguarding Database Queries', () => {
  let testClient;
  let testOrgId;

  beforeAll(async () => {
    testClient = createTestClient();
    const { organizationId } = await seedTestData(testClient);
    testOrgId = organizationId;
  });

  afterAll(async () => {
    await cleanupTestData(testClient, testOrgId);
  });

  it('fetches records with proper RLS', async () => {
    const records = await getSafeguardingRecords(testClient, testOrgId);

    expect(records).toHaveLength(2);
    expect(records[0].organization_id).toBe(testOrgId);
  });

  it('creates record with audit fields', async () => {
    const newRecord = await createSafeguardingRecord(testClient, {
      organization_id: testOrgId,
      person_name: 'New Person',
      dbs_number: '111222333444',
      issue_date: '2025-01-01',
      expiry_date: '2026-01-01',
    });

    expect(newRecord.id).toBeDefined();
    expect(newRecord.created_at).toBeDefined();
    expect(newRecord.updated_at).toBeDefined();
  });
});

```

## E2E Testing

### What to E2E Test

Critical user journeys that generate revenue or ensure compliance.

### Example: Onboarding Flow

```tsx
// tests/e2e/onboarding.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('new user can sign up and see compliance issues', async ({ page }) => {
    // 1. Start at landing page
    await page.goto('/');

    // 2. Click start trial
    await page.click('text=Start 30-Day Free Trial');

    // 3. Enter email
    await page.fill('input[type="email"]', 'test@charity.org');
    await page.click('text=Send Magic Link');

    // 4. Simulate clicking magic link (in dev, auto-login)
    await page.goto('/auth/callback?token=test-token');

    // 5. Complete setup
    await expect(page).toHaveURL('/onboarding');
    await page.fill('input[name="charity_number"]', '1234567');
    await page.selectOption('select[name="year_end_month"]', '3'); // March
    await page.click('text=Continue');

    // 6. See compliance dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-test="compliance-score"]')).toBeVisible();
    await expect(page.locator('[data-test="compliance-score"]')).toContainText('%');

    // 7. Verify urgent actions shown
    const urgentActions = page.locator('[data-test="urgent-actions"]');
    await expect(urgentActions).toBeVisible();
  });

  test('can import CSV data during onboarding', async ({ page }) => {
    // ... login steps ...

    // Upload CSV
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/sample-dbs.csv');

    // Wait for processing
    await expect(page.locator('text=Found 5 DBS records')).toBeVisible();

    // Confirm import
    await page.click('text=Import All');

    // Verify data imported
    await page.goto('/compliance/safeguarding');
    await expect(page.locator('table tbody tr')).toHaveCount(5);
  });
});

```

### Example: Critical Compliance Path

```tsx
// tests/e2e/compliance-critical-path.spec.ts

test.describe('Compliance Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as existing user
    await page.goto('/login');
    await page.fill('input[type="email"]', 'sarah@testcharity.org');
    await page.click('text=Send Magic Link');
    await page.goto('/auth/callback?token=test-token');
  });

  test('can add DBS record and see score update', async ({ page }) => {
    // Navigate to safeguarding
    await page.click('text=Safeguarding');

    // Add new DBS
    await page.click('text=Add DBS Check');
    await page.fill('input[name="person_name"]', 'John Volunteer');
    await page.fill('input[name="dbs_number"]', '123456789012');
    await page.fill('input[name="issue_date"]', '2025-01-01');
    await page.fill('input[name="expiry_date"]', '2026-01-01');
    await page.click('text=Save');

    // Verify added
    await expect(page.locator('text=John Volunteer')).toBeVisible();

    // Check score increased
    await page.goto('/dashboard');
    const score = await page.locator('[data-test="compliance-score"]').textContent();
    expect(parseInt(score)).toBeGreaterThan(0);
  });

  test('shows expiry warnings', async ({ page }) => {
    // Add DBS expiring soon
    await page.goto('/compliance/safeguarding');
    await page.click('text=Add DBS Check');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await page.fill('input[name="person_name"]', 'Expiring Soon');
    await page.fill('input[name="dbs_number"]', '999888777666');
    await page.fill('input[name="issue_date"]', '2024-01-01');
    await page.fill('input[name="expiry_date"]', tomorrow.toISOString().split('T')[0]);
    await page.click('text=Save');

    // Verify warning shown
    await expect(page.locator('[data-test="expiry-warning"]')).toBeVisible();
    await expect(page.locator('[data-test="expiry-warning"]')).toContainText('expires tomorrow');
  });
});

```

### Example: Annual Return Generation

```tsx
// tests/e2e/annual-return.spec.ts

test('can generate annual return', async ({ page }) => {
  // ... login ...

  await page.goto('/reports/annual-return');

  // Check readiness
  await expect(page.locator('[data-test="ar-progress"]')).toContainText('%');

  // Generate preview
  await page.click('text=Generate Preview');

  // Wait for generation
  await expect(page.locator('[data-test="ar-preview"]')).toBeVisible({ timeout: 10000 });

  // Verify can copy fields
  await page.click('[data-test="copy-field-safeguarding"]');
  await expect(page.locator('text=Copied!')).toBeVisible();

  // Export CSV
  await page.click('text=Export All Data');
  const download = await page.waitForEvent('download');
  expect(download.suggestedFilename()).toContain('annual-return');
});

```

## Testing Best Practices

### 1. Test Data Isolation

```tsx
// tests/utils/test-db.ts

export async function createTestOrganization(name: string) {
  const testOrg = {
    id: `test-org-${Date.now()}`,
    name: `Test ${name}`,
    charity_number: `TEST${Date.now()}`,
    // ... other fields
  };

  // Always cleanup in afterAll
  return testOrg;
}

```

### 2. Mock External Services

```tsx
// tests/mocks/ai-service.ts

export const mockAIService = {
  extractDocument: jest.fn().mockResolvedValue({
    person_name: 'Extracted Name',
    dbs_number: '123456789012',
    issue_date: '2025-01-01',
    expiry_date: '2026-01-01',
  }),

  generateNarrative: jest.fn().mockResolvedValue(
    'This charity has maintained excellent compliance...'
  ),
};

// In tests
jest.mock('@/services/ai', () => mockAIService);

```

### 3. Use Data Attributes for E2E

```tsx
// In components
<div data-test="compliance-score">{score}%</div>

// In tests
await page.locator('[data-test="compliance-score"]')

```

### 4. Parallel Test Execution

```json
// package.json
{
  "scripts": {
    "test:unit": "jest --maxWorkers=4",
    "test:e2e": "playwright test --workers=4",
    "test:all": "npm run test:unit && npm run test:e2e"
  }
}

```

## Test Coverage Goals

### Minimum Coverage (for 5-day build)

- **Business Logic**: 90% coverage
- **API Routes**: 80% coverage
- **Overall**: 60% coverage

### What to Test on Each Day

**Day 1**: Auth flows (E2E)
**Day 2**: Compliance calculations (Unit)
**Day 3**: AI extraction/generation (Integration)
**Day 4**: Report generation (E2E)
**Day 5**: Critical paths (E2E)

## Quick Test Templates

### Unit Test Template

```tsx
import { functionToTest } from '../module';

describe('functionToTest', () => {
  it('does what it should', () => {
    const input = 'test';
    const expected = 'TEST';

    expect(functionToTest(input)).toBe(expected);
  });

  it('handles edge cases', () => {
    expect(functionToTest(null)).toBe('');
    expect(functionToTest('')).toBe('');
  });
});

```

### API Test Template

```tsx
import { GET, POST } from '../route';

describe('API Route', () => {
  it('GET returns data', async () => {
    const req = new Request('http://localhost/api/endpoint');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toBeDefined();
  });
});

```

### E2E Test Template

```tsx
import { test, expect } from '@playwright/test';

test('user can do something', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Button');
  await expect(page.locator('.result')).toBeVisible();
});

```

## Summary

Focus on testing:

1. **Business logic** that could break compliance
2. **Critical paths** that make money
3. **Data transformations** that could corrupt data

Skip testing:

1. UI component styling
2. Third-party integrations
3. Generated code

This pragmatic approach ensures quality without slowing down the 5-day build.