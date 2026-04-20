# Knowledge Companion - Infrastructure Documentation

This document details the AWS infrastructure, deployment configuration, and operational procedures for the Knowledge Companion application.

## Table of Contents

- [AWS Infrastructure Overview](#aws-infrastructure-overview)
- [AWS Services Used](#aws-services-used)
- [SAM Template Configuration](#sam-template-configuration)
- [DynamoDB Tables](#dynamodb-tables)
- [IAM Roles & Permissions](#iam-roles--permissions)
- [Environment Variables](#environment-variables)
- [Cost Estimation](#cost-estimation)
- [Deployment Procedures](#deployment-procedures)
- [Disaster Recovery](#disaster-recovery)

---

## AWS Infrastructure Overview

### Resource Map

```
┌─────────────────────────────────────────────────────────────────┐
│                          AWS Account                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────── Compute Layer ─────────────────────┐    │
│  │                                                          │    │
│  │  AWS Lambda Functions (Node.js 18)                     │    │
│  │  ├─ ChatFunction          (512 MB, 30s timeout)        │    │
│  │  ├─ ConversationsFunction (256 MB, 10s timeout)        │    │
│  │  ├─ FeedbackFunction      (256 MB, 10s timeout)        │    │
│  │  └─ AnalyticsFunction     (512 MB, 15s timeout)        │    │
│  │                                                          │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌──────────────────── API Layer ──────────────────────────┐    │
│  │                                                          │    │
│  │  API Gateway (REST API)                                 │    │
│  │  ├─ POST   /chat                                        │    │
│  │  ├─ GET    /conversations                               │    │
│  │  ├─ POST   /feedback                                    │    │
│  │  ├─ GET    /analytics                                   │    │
│  │  └─ OPTIONS /* (CORS preflight)                         │    │
│  │                                                          │    │
│  │  Stage: Prod                                            │    │
│  │  Throttling: 10,000 req/sec                             │    │
│  │                                                          │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌──────────────────── AI/ML Layer ────────────────────────┐    │
│  │                                                          │    │
│  │  Amazon Bedrock                                         │    │
│  │  ├─ Model: amazon.nova-pro-v1:0                        │    │
│  │  ├─ Knowledge Base: Policy Documents                   │    │
│  │  └─ Embeddings: amazon.titan-embed-text-v1            │    │
│  │                                                          │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌──────────────────── Data Layer ─────────────────────────┐    │
│  │                                                          │    │
│  │  DynamoDB Tables                                        │    │
│  │  ├─ kb-conversations (On-Demand)                       │    │
│  │  │   └─ PK: conversationId, SK: timestamp             │    │
│  │  └─ kb-feedback (On-Demand)                            │    │
│  │      └─ PK: feedbackId                                  │    │
│  │                                                          │    │
│  │  Amazon S3                                              │    │
│  │  └─ Bucket: kb-knowledge-documents                     │    │
│  │      └─ Contains: Policy PDFs, HR docs, handbooks      │    │
│  │                                                          │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌──────────────────── Frontend Hosting ───────────────────┐    │
│  │                                                          │    │
│  │  AWS Amplify                                            │    │
│  │  ├─ Domain: *.amplifyapp.com                           │    │
│  │  ├─ SSL: Auto-provisioned certificate                  │    │
│  │  ├─ CI/CD: Connected to GitHub repository              │    │
│  │  └─ CDN: Global edge locations                         │    │
│  │                                                          │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌──────────────────── Monitoring ─────────────────────────┐    │
│  │                                                          │    │
│  │  CloudWatch                                             │    │
│  │  ├─ Log Groups: /aws/lambda/*                          │    │
│  │  ├─ Metrics: Custom + AWS service metrics              │    │
│  │  └─ Alarms: Error rate, latency thresholds             │    │
│  │                                                          │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## AWS Services Used

### 1. AWS Lambda

**Purpose**: Serverless compute for all backend logic

**Functions**:

| Function | Runtime | Memory | Timeout | Purpose |
|----------|---------|--------|---------|---------|
| ChatFunction | Node.js 18 | 512 MB | 30s | Process AI chat requests |
| ConversationsFunction | Node.js 18 | 256 MB | 10s | Retrieve conversation history |
| FeedbackFunction | Node.js 18 | 256 MB | 10s | Store user feedback |
| AnalyticsFunction | Node.js 18 | 512 MB | 15s | Generate dashboard analytics |

**Configuration**:
```yaml
Runtime: nodejs18.x
Architectures:
  - x86_64
Environment:
  Variables:
    KNOWLEDGE_BASE_ID: !Ref KnowledgeBaseId
    MODEL_ID: amazon.nova-pro-v1:0
```

---

### 2. Amazon API Gateway

**Type**: REST API

**Purpose**: HTTP interface for frontend-backend communication

**Configuration**:
- **Endpoint Type**: Regional
- **Protocol**: HTTPS only
- **CORS**: Enabled for all origins
- **Throttling**: 10,000 requests/second, 5,000 burst
- **Cache**: Disabled (can be enabled for GET endpoints)

**Stages**:
- **Prod**: Production environment
- **Dev**: Development environment (optional)

**Endpoints**:
```
POST   /chat           → ChatFunction
GET    /conversations  → ConversationsFunction
POST   /feedback       → FeedbackFunction
GET    /analytics      → AnalyticsFunction
```

---

### 3. Amazon Bedrock

**Purpose**: AI/ML capabilities for intelligent responses

**Components**:

#### A. Foundation Model
- **Model ID**: `amazon.nova-pro-v1:0`
- **Capabilities**: Text generation, multilingual support
- **Token Limit**: 200,000 tokens per request
- **Region**: us-east-1

#### B. Knowledge Base
- **Embedding Model**: `amazon.titan-embed-text-v1`
- **Vector Dimensions**: 1536
- **Data Source**: S3 bucket (kb-knowledge-documents)
- **Sync Schedule**: Manual or scheduled
- **Chunking Strategy**: Fixed size (300 tokens, 20% overlap)

#### C. Retrieval Configuration
- **Search Type**: Semantic search (vector similarity)
- **Number of Results**: 5
- **Relevance Score Threshold**: 0.5

---

### 4. Amazon DynamoDB

**Purpose**: NoSQL database for conversations and feedback

#### Table 1: kb-conversations

**Configuration**:
```yaml
TableName: kb-conversations
BillingMode: PAY_PER_REQUEST  # On-demand pricing
PointInTimeRecoveryEnabled: true
```

**Schema**:
| Attribute | Type | Description |
|-----------|------|-------------|
| conversationId (PK) | String | UUID v4 |
| timestamp (SK) | String | ISO 8601 timestamp |
| messages | List | Array of message objects |
| language | String | 'en' or 'es' |
| userId | String | User identifier (optional) |

**Indexes**: None (using primary key only)

**Item Example**:
```json
{
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-03-25T20:15:30.000Z",
  "messages": [
    {
      "role": "user",
      "content": "What is the vacation policy?"
    },
    {
      "role": "assistant",
      "content": "Our vacation policy...",
      "citations": [...]
    }
  ],
  "language": "en",
  "userId": "employee@yourorganization.com"
}
```

#### Table 2: kb-feedback

**Configuration**:
```yaml
TableName: kb-feedback
BillingMode: PAY_PER_REQUEST
PointInTimeRecoveryEnabled: true
```

**Schema**:
| Attribute | Type | Description |
|-----------|------|-------------|
| feedbackId (PK) | String | Generated ID |
| messageId | String | Reference to message |
| rating | String | 'up' or 'down' |
| timestamp | Number | Unix timestamp (ms) |
| userId | String | User identifier (optional) |

---

### 5. Amazon S3

**Purpose**: Store company documents for Knowledge Base

**Bucket**: `kb-knowledge-documents`

**Configuration**:
```yaml
BucketName: kb-knowledge-documents
Versioning: Enabled
Encryption:
  ServerSideEncryptionConfiguration:
    - ServerSideEncryptionByDefault:
        SSEAlgorithm: AES256
PublicAccessBlockConfiguration:
  BlockPublicAcls: true
  BlockPublicPolicy: true
  IgnorePublicAcls: true
  RestrictPublicBuckets: true
```

**Folder Structure**:
```
kb-knowledge-documents/
├── hr/
│   ├── vacation-policy.pdf
│   ├── benefits-guide.pdf
│   └── employee-handbook.pdf
├── it/
│   ├── tech-support-guide.pdf
│   └── software-access.pdf
└── policies/
    ├── code-of-conduct.pdf
    └── remote-work-policy.pdf
```

---

### 6. AWS Amplify

**Purpose**: Frontend hosting with CI/CD

**Configuration**:
- **Framework**: React
- **Build Command**: `npm run build`
- **Build Output Directory**: `dist`
- **Base Directory**: `frontend`
- **Node Version**: 18

**Environment Variables** (set in Amplify Console):
```
VITE_API_ENDPOINT=https://{api-id}.execute-api.us-east-1.amazonaws.com/Prod
VITE_AWS_REGION=us-east-1
```

**Custom Domain** (optional):
- Domain: `assistant.yourcompany.com`
- SSL Certificate: Auto-provisioned by Amplify

---

### 7. Amazon CloudWatch

**Purpose**: Logging, monitoring, and alerting

**Log Groups**:
- `/aws/lambda/kb-chat` (7-day retention)
- `/aws/lambda/kb-conversations` (7-day retention)
- `/aws/lambda/kb-feedback` (7-day retention)
- `/aws/lambda/kb-analytics` (7-day retention)
- `/aws/apigateway/kb-api` (7-day retention)

**Metrics**:
- Lambda invocations, errors, duration
- API Gateway 4XX, 5XX, latency
- DynamoDB consumed capacity
- Custom: Conversation count, feedback ratio

**Alarms** (recommended):
- High error rate (> 5% of requests)
- High latency (> 5 seconds p99)
- DynamoDB throttling events

---

## SAM Template Configuration

### Complete SAM Template Structure

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: Knowledge Companion Backend

Globals:
  Function:
    Runtime: nodejs18.x
    MemorySize: 512
    Timeout: 30
    Environment:
      Variables:
        KNOWLEDGE_BASE_ID: !Ref KnowledgeBaseId
        MODEL_ID: !Ref BedrockModelId
        CONVERSATIONS_TABLE: !Ref ConversationsTable
        FEEDBACK_TABLE: !Ref FeedbackTable

Parameters:
  KnowledgeBaseId:
    Type: String
    Description: Amazon Bedrock Knowledge Base ID
  BedrockModelId:
    Type: String
    Default: amazon.nova-pro-v1:0
    Description: Bedrock model identifier

Resources:
  # API Gateway
  CompanionApi:
    Type: AWS::Serverless::Api
    Properties:
      StageName: Prod
      Cors:
        AllowMethods: "'POST, GET, OPTIONS'"
        AllowHeaders: "'Content-Type'"
        AllowOrigin: "'*'"

  # Lambda Functions
  ChatFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/handlers/
      Handler: chat.handler
      Events:
        ChatApi:
          Type: Api
          Properties:
            RestApiId: !Ref CompanionApi
            Path: /chat
            Method: post
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref ConversationsTable
        - Statement:
            - Effect: Allow
              Action:
                - bedrock:InvokeModel
                - bedrock:Retrieve
              Resource: '*'

  # DynamoDB Tables
  ConversationsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: kb-conversations
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: conversationId
          AttributeType: S
        - AttributeName: timestamp
          AttributeType: S
      KeySchema:
        - AttributeName: conversationId
          KeyType: HASH
        - AttributeName: timestamp
          KeyType: RANGE
      PointInTimeRecoverySpecification:
        PointInTimeRecoveryEnabled: true

Outputs:
  ApiEndpoint:
    Description: API Gateway endpoint URL
    Value: !Sub 'https://${CompanionApi}.execute-api.${AWS::Region}.amazonaws.com/Prod'
  ConversationsTableName:
    Description: DynamoDB table for conversations
    Value: !Ref ConversationsTable
```

---

## IAM Roles & Permissions

### Lambda Execution Role

**Managed Policies**:
- `AWSLambdaBasicExecutionRole` (CloudWatch Logs)

**Custom Policies**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:Retrieve",
        "bedrock:RetrieveAndGenerate"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:UpdateItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:*:table/kb-conversations",
        "arn:aws:dynamodb:us-east-1:*:table/kb-feedback"
      ]
    }
  ]
}
```

### Amplify Service Role

**Permissions**:
- Read from connected Git repository
- Write CloudWatch Logs
- Create/update CloudFront distributions

---

## Environment Variables

### Backend (Lambda)

| Variable | Description | Example |
|----------|-------------|---------|
| `KNOWLEDGE_BASE_ID` | Bedrock KB identifier | `kb-abc123xyz456` |
| `MODEL_ID` | Bedrock model to use | `amazon.nova-pro-v1:0` |
| `CONVERSATIONS_TABLE` | DynamoDB table name | `kb-conversations` |
| `FEEDBACK_TABLE` | DynamoDB table name | `kb-feedback` |
| `AWS_REGION` | AWS region (auto-set) | `us-east-1` |

### Frontend (Amplify)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_ENDPOINT` | API Gateway URL | `https://abc.execute-api.us-east-1.amazonaws.com/Prod` |
| `VITE_AWS_REGION` | AWS region | `us-east-1` |

---

## Cost Estimation

### Monthly Cost Breakdown (Estimated for 1,000 users)

#### Assumptions:
- 10,000 conversations/month
- 50,000 API requests/month
- 100 GB data storage
- Minimal analytics queries

| Service | Usage | Cost/Month |
|---------|-------|------------|
| **Lambda** | 50,000 invocations, 512 MB, 5s avg | ~$5 |
| **API Gateway** | 50,000 requests | ~$0.50 |
| **Bedrock (Nova Pro)** | 10M input tokens, 2M output tokens | ~$150 |
| **Bedrock Knowledge Base** | 10,000 queries | ~$20 |
| **DynamoDB** | On-demand, 50K writes, 200K reads | ~$15 |
| **S3** | 100 GB storage, minimal requests | ~$2.50 |
| **Amplify** | 1 app, 10 GB storage, 100 GB transfer | ~$15 |
| **CloudWatch** | Logs + metrics | ~$5 |
| **Total** | | **~$213/month** |

**Cost Optimization Tips**:
- Enable DynamoDB auto-scaling for predictable workloads
- Use Lambda reserved concurrency to avoid over-provisioning
- Archive old S3 documents to Glacier
- Set CloudWatch log retention to 7 days

---

## Deployment Procedures

### Initial Deployment

```bash
# 1. Clone repository
git clone [your-repo-url]
cd kb-companion-backend

# 2. Deploy backend
cd backend
npm install
sam build
sam deploy --guided

# 3. Note the API endpoint from outputs
# Example: https://abc123.execute-api.us-east-1.amazonaws.com/Prod

# 4. Deploy frontend
cd ../frontend
cp .env.example .env.local
# Edit .env.local with API endpoint
npm install
npm run build

# 5. Deploy to Amplify (via GitHub integration)
# Or manually: aws s3 sync dist/ s3://your-bucket/
```

### CI/CD Deployment

**Using AWS CodeBuild**:
```bash
# buildspec.yml handles:
# 1. Backend: sam build && sam deploy
# 2. Frontend: npm run build && aws s3 sync
```

**Using GitHub Actions** (future):
```yaml
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy Backend
        run: cd backend && sam build && sam deploy --no-confirm-changeset
      - name: Deploy Frontend
        run: cd frontend && npm run build
```

---

## Disaster Recovery

### Backup Strategy

**DynamoDB**:
- Point-in-time recovery (enabled)
- Automatic backups (last 35 days)
- On-demand backups before major changes

**S3**:
- Versioning enabled
- Cross-region replication (optional)
- Lifecycle policies for old versions

**Lambda**:
- Code stored in S3 by SAM
- Version management via Git

### Recovery Procedures

**Scenario 1: DynamoDB Data Loss**
```bash
# Restore from point-in-time
aws dynamodb restore-table-to-point-in-time \
  --source-table-name kb-conversations \
  --target-table-name kb-conversations-restored \
  --restore-date-time 2025-03-24T12:00:00Z
```

**Scenario 2: Lambda Function Failure**
```bash
# Rollback to previous version
sam deploy --no-confirm-changeset --parameter-overrides Version=1.0.0
```

**Scenario 3: Complete Region Failure**
- Deploy stack to secondary region (us-west-2)
- Update Amplify environment variables to point to new API
- Restore DynamoDB tables from backups

### Monitoring & Alerts

**CloudWatch Alarms**:
- Lambda error rate > 5%
- API Gateway latency > 5s (p99)
- DynamoDB throttling events
- Bedrock quota approaching limits

**SNS Notifications**:
- Email alerts for critical failures
- SMS for high-severity incidents

---

## Maintenance Procedures

### Regular Tasks

**Weekly**:
- Review CloudWatch logs for errors
- Check Bedrock token usage and costs
- Monitor DynamoDB capacity metrics

**Monthly**:
- Sync new documents to S3 for Knowledge Base
- Review and archive old conversations
- Update Bedrock KB with new documents
- Security patch updates for Lambda runtime

**Quarterly**:
- Cost optimization review
- Performance tuning (Lambda memory, timeout)
- Security audit (IAM permissions, encryption)
- Disaster recovery drill

---

## Troubleshooting

### Common Issues

**Issue**: High Lambda cold start times
- **Solution**: Enable provisioned concurrency or increase memory

**Issue**: DynamoDB throttling
- **Solution**: Switch to provisioned capacity with auto-scaling

**Issue**: Bedrock quota exceeded
- **Solution**: Request quota increase via AWS Support

**Issue**: High costs
- **Solution**: Review CloudWatch metrics, optimize Lambda memory, reduce log retention
