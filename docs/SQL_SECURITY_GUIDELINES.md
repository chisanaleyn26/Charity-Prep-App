# SQL Security Guidelines - Charity Prep

## 🔒 Preventing SQL Injection

### ✅ ALWAYS Use Parameterized Queries

**Good - Using Supabase Query Builder:**
```typescript
// Safe - parameters are automatically escaped
const { data } = await supabase
  .from('organizations')
  .select('*')
  .eq('name', userInput) // userInput is safely parameterized
  .single()
```

**Good - Using Parameterized RPC:**
```typescript
// If you must use RPC, always use parameters
const { data } = await supabase
  .rpc('search_organizations', {
    search_term: userInput // Passed as parameter, not concatenated
  })
```

### ❌ NEVER Concatenate User Input

**Bad - SQL Injection Vulnerable:**
```typescript
// NEVER DO THIS
const query = `SELECT * FROM users WHERE email = '${userInput}'`
const { data } = await supabase.rpc('execute_sql', { sql: query })
```

**Bad - String Concatenation:**
```typescript
// NEVER DO THIS
const { data } = await supabase
  .from('organizations')
  .select('*')
  .filter('name', 'ilike', `%${userInput}%`) // Still vulnerable
```

## 🛡️ Input Validation Best Practices

### 1. Validate Before Querying
```typescript
import { z } from 'zod'

const searchSchema = z.object({
  term: z.string().min(1).max(100).regex(/^[a-zA-Z0-9\s-]+$/),
  limit: z.number().int().min(1).max(100)
})

export async function searchOrganizations(input: unknown) {
  // Validate input first
  const validated = searchSchema.parse(input)
  
  // Now safe to use
  const { data } = await supabase
    .from('organizations')
    .select('*')
    .ilike('name', `%${validated.term}%`)
    .limit(validated.limit)
}
```

### 2. Escape Special Characters
```typescript
function escapeForILike(input: string): string {
  // Escape special pattern characters
  return input
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
}

// Usage
const safeTerm = escapeForILike(userInput)
const { data } = await supabase
  .from('organizations')
  .select('*')
  .ilike('name', `%${safeTerm}%`)
```

### 3. Use Type-Safe Queries
```typescript
// Define allowed columns
const ALLOWED_COLUMNS = ['name', 'created_at', 'updated_at'] as const
type AllowedColumn = typeof ALLOWED_COLUMNS[number]

function isAllowedColumn(column: string): column is AllowedColumn {
  return ALLOWED_COLUMNS.includes(column as AllowedColumn)
}

export async function sortedQuery(orderBy: string) {
  if (!isAllowedColumn(orderBy)) {
    throw new Error('Invalid sort column')
  }
  
  // Now safe to use
  const { data } = await supabase
    .from('organizations')
    .select('*')
    .order(orderBy)
}
```

## 🚫 Forbidden Patterns

1. **No Dynamic Table Names**
   ```typescript
   // NEVER allow user to specify table names
   const table = userInput // DANGEROUS
   const { data } = await supabase.from(table).select('*')
   ```

2. **No Raw SQL Execution**
   ```typescript
   // NEVER expose raw SQL execution to users
   await supabase.rpc('execute_sql', { sql: userQuery }) // FORBIDDEN
   ```

3. **No Dynamic Column Selection**
   ```typescript
   // NEVER allow arbitrary column selection
   const columns = userInput // DANGEROUS
   const { data } = await supabase.from('users').select(columns)
   ```

## 🔍 Code Review Checklist

- [ ] All database queries use Supabase query builder
- [ ] No string concatenation in queries
- [ ] All user inputs are validated with Zod schemas
- [ ] Special characters are properly escaped
- [ ] Table and column names are hardcoded or from an allowed list
- [ ] No raw SQL execution endpoints exposed
- [ ] RPC functions use parameterized queries
- [ ] Error messages don't expose database structure

## 🛠️ Automated Security Checks

### Pre-commit Hook
```bash
#!/bin/bash
# Add to .git/hooks/pre-commit

# Check for SQL injection patterns
if grep -r "execute_sql\|\.raw(\|query.*\${" --include="*.ts" --include="*.tsx" .; then
  echo "❌ Potential SQL injection vulnerability detected!"
  echo "Please use Supabase query builder instead of raw SQL."
  exit 1
fi
```

### ESLint Rule
```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'CallExpression[callee.property.name="rpc"][arguments.0.value="execute_sql"]',
        message: 'Direct SQL execution is forbidden. Use Supabase query builder.'
      }
    ]
  }
}
```

## 📚 Resources

- [OWASP SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-createpolicy.html)