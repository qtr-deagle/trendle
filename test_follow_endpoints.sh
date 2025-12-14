#!/usr/bin/env bash

echo "Testing Follow Functionality API Endpoints"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8000/api"

# Test data
TEST_EMAIL="test@example.com"
TEST_PASSWORD="test123456"
TEST_USERNAME="testuser"
TEST_USERNAME2="testuser2"

echo -e "\n${YELLOW}1. Testing User Registration${NC}"
echo "Registering test users..."

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$TEST_USERNAME\",
    \"email\": \"test1@example.com\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "Response: $REGISTER_RESPONSE"

REGISTER_RESPONSE2=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$TEST_USERNAME2\",
    \"email\": \"test2@example.com\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "Response: $REGISTER_RESPONSE2"

echo -e "\n${YELLOW}2. Testing User Login${NC}"
echo "Logging in as first user..."

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test1@example.com\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "Response: $LOGIN_RESPONSE"
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Extracted Token: $TOKEN"

echo -e "\n${YELLOW}3. Testing Check Follow Status (not following yet)${NC}"
echo "Checking if user1 is following user2..."

FOLLOW_STATUS=$(curl -s -X GET "$BASE_URL/user/$TEST_USERNAME2/follow-status" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $FOLLOW_STATUS"

echo -e "\n${YELLOW}4. Testing Follow User${NC}"
echo "User1 following user2..."

FOLLOW_RESPONSE=$(curl -s -X POST "$BASE_URL/user/$TEST_USERNAME2/follow" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $FOLLOW_RESPONSE"

echo -e "\n${YELLOW}5. Testing Check Follow Status (after following)${NC}"
echo "Checking if user1 is following user2..."

FOLLOW_STATUS=$(curl -s -X GET "$BASE_URL/user/$TEST_USERNAME2/follow-status" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $FOLLOW_STATUS"

echo -e "\n${YELLOW}6. Testing Get Following List${NC}"
echo "Getting user1's following list..."

FOLLOWING_LIST=$(curl -s -X GET "$BASE_URL/user/$TEST_USERNAME/following" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $FOLLOWING_LIST"

echo -e "\n${YELLOW}7. Testing Unfollow User${NC}"
echo "User1 unfollowing user2..."

UNFOLLOW_RESPONSE=$(curl -s -X POST "$BASE_URL/user/$TEST_USERNAME2/unfollow" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $UNFOLLOW_RESPONSE"

echo -e "\n${YELLOW}8. Testing Check Follow Status (after unfollowing)${NC}"
echo "Checking if user1 is following user2..."

FOLLOW_STATUS=$(curl -s -X GET "$BASE_URL/user/$TEST_USERNAME2/follow-status" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $FOLLOW_STATUS"

echo -e "\n${GREEN}Follow functionality tests completed!${NC}"
