#!/bin/bash

# Test if the production deployment can authenticate with Bluesky
echo "Testing production Bluesky authentication..."

# Check environment
echo "Checking .env configuration..."
if grep -q "BLUESKY_APP_PASSWORD" .env; then
    echo "✓ BLUESKY_APP_PASSWORD is set in .env"
else
    echo "✗ BLUESKY_APP_PASSWORD is NOT set in .env"
    exit 1
fi

# Check database for Platform Founder
echo "Checking Platform Founder in database..."
psql "$DATABASE_URL" -c "SELECT email, atprotoEmail, atprotoHandle, role FROM \"User\" WHERE role = 'PLATFORM_FOUNDER' LIMIT 1;" 2>/dev/null || echo "Cannot connect to database directly"

