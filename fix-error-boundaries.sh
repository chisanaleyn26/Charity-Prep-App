#!/bin/bash

# Remove PageErrorBoundary imports from all pages
files=(
  "app/(app)/dashboard/page.tsx"
  "app/(app)/settings/profile/page.tsx"
  "app/(app)/reports/export/page.tsx"
  "app/(app)/reports/board-pack/page.tsx"
  "app/(app)/reports/certificates/page.tsx"
  "app/(app)/reports/ai/page.tsx"
  "app/(app)/compliance/score/page.tsx"
  "app/(app)/compliance/overseas-activities/page.tsx"
  "app/(app)/compliance/safeguarding/page.tsx"
  "app/(app)/compliance/fundraising/page.tsx"
  "app/(app)/reports/annual-return/page.tsx"
  "app/(app)/compliance/chat/page.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file"
    # Remove the import line
    sed -i '/import.*PageErrorBoundary.*from.*error-boundary/d' "$file"
    # Remove PageErrorBoundary wrapper tags
    sed -i '/<PageErrorBoundary>/d' "$file"
    sed -i '/<\/PageErrorBoundary>/d' "$file"
  fi
done

echo "Done removing PageErrorBoundary imports"