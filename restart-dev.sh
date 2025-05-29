#!/bin/bash

echo "Cleaning up build cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "Starting Next.js development server..."
npm run dev