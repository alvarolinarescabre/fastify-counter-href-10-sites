#!/bin/bash

# Test script for Fastify HREF Counter API
# Usage: ./test.sh

set -e

BASE_URL="http://localhost:8080"
echo "🧪 Testing Fastify HREF Counter API at $BASE_URL"
echo "=================================================="

# Test 1: Health check
echo "1️⃣  Testing health check..."
response=$(curl -s "$BASE_URL/healthcheck")
if echo "$response" | grep -q '"data":"Ok!"'; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    exit 1
fi

# Test 2: API info
echo "2️⃣  Testing API info..."
response=$(curl -s "$BASE_URL/")
if echo "$response" | grep -q '/v1/tags'; then
    echo "✅ API info passed"
else
    echo "❌ API info failed"
    exit 1
fi

# Test 3: Cache stats
echo "3️⃣  Testing cache stats..."
response=$(curl -s "$BASE_URL/cache/stats")
if echo "$response" | grep -q 'keys'; then
    echo "✅ Cache stats passed"
else
    echo "❌ Cache stats failed"
    exit 1
fi

# Test 4: Single URL analysis
echo "4️⃣  Testing single URL analysis..."
response=$(curl -s "$BASE_URL/v1/tags/1")
if echo "$response" | grep -q '"status":"success"'; then
    echo "✅ Single URL analysis passed"
else
    echo "❌ Single URL analysis failed"
    exit 1
fi

# Test 5: All URLs analysis (first 2 for speed)
echo "5️⃣  Testing batch analysis (limited)..."
response=$(curl -s "$BASE_URL/v1/tags?limit=2")
if echo "$response" | grep -q '"summary"'; then
    echo "✅ Batch analysis passed"
else
    echo "❌ Batch analysis failed"
    exit 1
fi

# Test 6: Swagger documentation
echo "6️⃣  Testing Swagger documentation..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/docs")
if [ "$response" = "302" ]; then
    echo "✅ Swagger docs accessible"
else
    echo "❌ Swagger docs failed (HTTP $response)"
    exit 1
fi

echo ""
echo "🎉 All tests passed! API is working correctly."
echo "📖 Visit http://localhost:8080/docs for interactive documentation."
