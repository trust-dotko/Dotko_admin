#!/bin/bash

# =====================================================
# Security Check Script
# Run this before committing to check for secrets
# =====================================================

echo "🔒 Running security checks..."
echo ""

ERRORS=0

# Check 1: Verify .env.local is not tracked
echo "📋 Check 1: Verifying .env files are not tracked..."
if git ls-files | grep -E "\.env\.local|\.env$" | grep -v ".env.example" > /dev/null; then
  echo "❌ ERROR: .env files found in git!"
  echo "   The following files should NOT be committed:"
  git ls-files | grep -E "\.env\.local|\.env$" | grep -v ".env.example"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ No .env files tracked in git"
fi
echo ""

# Check 2: Look for hardcoded Firebase API keys
echo "📋 Check 2: Checking for hardcoded Firebase API keys..."
if git diff --cached | grep -E "AIzaSy[A-Za-z0-9_-]{33}" > /dev/null; then
  echo "❌ WARNING: Potential Firebase API key in staged changes!"
  echo "   Make sure all API keys are in environment variables"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ No hardcoded API keys in staged changes"
fi
echo ""

# Check 3: Look for private keys
echo "📋 Check 3: Checking for private keys..."
if git diff --cached | grep -E "BEGIN PRIVATE KEY" > /dev/null; then
  echo "❌ ERROR: Private key found in staged changes!"
  echo "   Private keys must NEVER be committed"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ No private keys in staged changes"
fi
echo ""

# Check 4: Look for common secret patterns
echo "📋 Check 4: Checking for common secret patterns..."
if git diff --cached | grep -iE "password.*=.*['\"][^'\"]{3,}|secret.*=.*['\"][^'\"]{3,}|token.*=.*['\"][^'\"]{3,}" | grep -v "process.env" > /dev/null; then
  echo "⚠️  WARNING: Potential hardcoded secrets found!"
  echo "   Review your staged changes to ensure no secrets are committed"
  echo "   (This might be a false positive)"
else
  echo "✅ No obvious secrets in staged changes"
fi
echo ""

# Summary
echo "================================"
if [ $ERRORS -eq 0 ]; then
  echo "✅ All security checks passed!"
  echo "   Safe to commit"
  exit 0
else
  echo "❌ Security checks failed: $ERRORS error(s)"
  echo "   DO NOT COMMIT until these are resolved"
  exit 1
fi
