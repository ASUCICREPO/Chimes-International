#!/bin/bash

# DynamoDB Setup Script for Knowledge Companion
# Run this script to create the required DynamoDB tables

echo "Creating DynamoDB tables for Knowledge Companion..."

# 1. Conversations Table
echo "Creating conversations table..."
aws dynamodb create-table \
  --table-name kb-conversations \
  --attribute-definitions \
    AttributeName=conversationId,AttributeType=S \
    AttributeName=timestamp,AttributeType=N \
  --key-schema \
    AttributeName=conversationId,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1 \
  --tags Key=Project,Value=KnowledgeCompanion Key=Environment,Value=Production

echo "✓ Conversations table created"

# 2. Feedback Table
echo "Creating feedback table..."
aws dynamodb create-table \
  --table-name kb-feedback \
  --attribute-definitions \
    AttributeName=messageId,AttributeType=S \
  --key-schema \
    AttributeName=messageId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1 \
  --tags Key=Project,Value=KnowledgeCompanion Key=Environment,Value=Production

echo "✓ Feedback table created"

echo ""
echo "✅ All tables created successfully!"
echo ""
echo "Table Details:"
echo "1. kb-conversations"
echo "   - Primary Key: conversationId (String)"
echo "   - Sort Key: timestamp (Number)"
echo "   - Stores: userId, message, response, language, citations"
echo ""
echo "2. kb-feedback"
echo "   - Primary Key: messageId (String)"
echo "   - Stores: rating (up/down), timestamp, userId"
echo ""
echo "Next steps:"
echo "1. Update Lambda IAM role to allow DynamoDB access"
echo "2. Deploy updated Lambda functions"
