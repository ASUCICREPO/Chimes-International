# Chimes Backend

AWS Lambda backend for the Chimes Knowledge Companion, built with AWS SAM.

## Tech Stack

- **AWS Lambda** with Node.js 18
- **API Gateway** for REST endpoints
- **Amazon Bedrock** for AI/ML (Nova Pro, Knowledge Bases)
- **DynamoDB** for data persistence
- **AWS SAM** for infrastructure as code

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured
- AWS SAM CLI installed
- Node.js 18 or higher

## Project Structure

```
backend/
├── src/
│   └── handlers/           # Lambda function handlers
├── template.yaml           # SAM template (infrastructure)
├── setup-dynamodb.sh       # DynamoDB setup script
└── package.json            # Dependencies
```

## Lambda Functions

1. **Chat Handler** - Processes chat messages using Bedrock Knowledge Base
2. **Conversations Handler** - Retrieves conversation history
3. **Feedback Handler** - Stores user feedback
4. **Analytics Handler** - Provides dashboard analytics

## API Endpoints

- `POST /chat` - Send a message and get AI response
- `GET /conversations` - Retrieve conversation history
- `POST /feedback` - Submit feedback for a message
- `GET /analytics` - Get analytics data for admin dashboard

## Deployment

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up DynamoDB Tables

```bash
chmod +x setup-dynamodb.sh
./setup-dynamodb.sh
```

### 3. Deploy with SAM

```bash
# Build the application
sam build

# Deploy to AWS
sam deploy --guided
```

Follow the prompts to configure:
- Stack name (e.g., `chimes-backend`)
- AWS Region
- Confirm changes before deploy
- Allow SAM CLI IAM role creation
- Save configuration

### 4. Get API Endpoint

After deployment, SAM will output your API Gateway endpoint URL. Use this in your frontend's `VITE_API_ENDPOINT` environment variable.

## Environment Variables

The Lambda functions use these environment variables (configured in `template.yaml`):

- `KNOWLEDGE_BASE_ID` - Amazon Bedrock Knowledge Base ID
- `MODEL_ID` - Bedrock model ID (default: Nova Pro)
- `CONVERSATIONS_TABLE` - DynamoDB table for conversations
- `FEEDBACK_TABLE` - DynamoDB table for feedback

## Local Development

To test locally using SAM:

```bash
# Start local API
sam local start-api

# Invoke a specific function
sam local invoke ChatFunction --event events/chat-event.json
```

## Monitoring

- **CloudWatch Logs** - View Lambda function logs
- **CloudWatch Metrics** - Monitor API Gateway and Lambda metrics
- **X-Ray** - Distributed tracing (if enabled)

## Security

- API endpoints are public but should be protected with authentication in production
- Lambda functions use IAM roles with least-privilege permissions
- DynamoDB tables have encryption at rest enabled
- Secrets should be stored in AWS Secrets Manager or Parameter Store

## Troubleshooting

### Permission Errors

Ensure your Lambda execution role has permissions for:
- Bedrock (invoke model, retrieve and generate)
- DynamoDB (read/write to tables)
- CloudWatch Logs (create log groups and streams)

### Deployment Issues

```bash
# Delete the stack and redeploy
sam delete
sam build && sam deploy --guided
```
