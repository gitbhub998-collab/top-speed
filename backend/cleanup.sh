#!/bin/bash

# Cleanup Script for TOP SPEED - Removes all user data before deployment
# This script will:
# 1. Delete all user accounts from the database
# 2. Clear any localStorage data from browsers

echo "🔴 WARNING: This will delete ALL user accounts from the database!"
echo "======================================================================"
read -p "Continue? (yes/no): " confirm

if [ "$confirm" = "yes" ]; then
  echo "✅ Starting cleanup..."
  
  # Extract and run the cleanup-users.js script
  if [ -f "backend/cleanup-users.js" ]; then
    echo "📌 Deleting all users from database..."
    cd backend
    node cleanup-users.js
    cd ..
  else
    echo "❌ Error: cleanup-users.js not found in backend directory"
    exit 1
  fi
  
  echo "=========================================================================="
  echo "✅ CLEANUP COMPLETE!"
  echo "=========================================================================="
  echo ""
  echo "📝 Additional steps to clear browser storage:"
  echo "  1. Clear browser localStorage: Settings > Storage > LocalStorage"
  echo "  2. Clear browser cache: Settings > Browser Cache"
  echo "  3. Logout from all browsers"
  echo ""
  echo "✨ Your application is now ready for deployment!"
else
  echo "❌ Cleanup cancelled."
  exit 1
fi
