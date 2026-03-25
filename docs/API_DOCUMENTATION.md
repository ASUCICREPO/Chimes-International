# Chimes Knowledge Companion - API Documentation

An AI-powered internal knowledge assistant for Chimes International employees that provides instant answers to HR, IT, benefits, and policy questions with source citations using Amazon Bedrock Knowledge Bases.

## Architecture Overview

This system uses AWS API Gateway + Lambda architecture with Amazon Bedrock for AI capabilities:

- **API Gateway**: RESTful API endpoints for all client interactions
- **AWS Lambda**: Serverless compute for business logic
- **Amazon Bedrock**: AI/ML capabilities (Nova Pro model + Knowledge Bases)
- **DynamoDB**: Data persistence for conversations and feedback
- **React Frontend**: User interface deployed on AWS Amplify

---

## Base URL

```
Production: https://{api-id}.execute-api.{region}.amazonaws.com/Prod
Development: Configure via VITE_API_ENDPOINT environment variable
```

---

## API Endpoints

### 1. Chat Endpoint

**POST** `/chat` — Send a message and receive AI-generated response

**Purpose**: Process user questions using Amazon Bedrock Knowledge Base and return contextual answers with source citations

**CORS**: Enabled for all origins

**Request Body**:

```json
{
  "message": "string (required) - User's question",
  "language": "string (required) - 'en' or 'es'",
  "model": "string (required) - Bedrock model ID (e.g., 'amazon.nova-pro-v1:0')",
  "conversationHistory": [
    {
      "role": "user | assistant",
      "content": "string - Previous message content"
    }
  ]
}
```

**Response Examples**:

✅ **200 Success**:
```json
{
  "message": "AI-generated response in requested language",
  "citations": [
    {
      "source": "s3://bucket/path/to/document.pdf",
      "snippet": "Relevant text excerpt from source document"
    }
  ]
}
```

❌ **400 Bad Request**:
```json
{
  "error": "Message, language, and model are required"
}
```

❌ **500 Internal Server Error**:
```json
{
  "error": "Detailed error message from processing"
}
```

**How It Works**:

1. Receives user question with language preference
2. Queries Amazon Bedrock Knowledge Base for relevant documents
3. Uses Bedrock Nova Pro to generate contextual answer
4. Returns response with citations to source documents
5. Maintains conversation context for follow-up questions

**Example Request**:

```bash
curl -X POST https://api-id.execute-api.us-east-1.amazonaws.com/Prod/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the company vacation policy?",
    "language": "en",
    "model": "amazon.nova-pro-v1:0",
    "conversationHistory": []
  }'
```

---

### 2. Conversations Endpoint

**GET** `/conversations` — Retrieve conversation history

**Purpose**: Fetch recent conversation sessions for display in sidebar

**CORS**: Enabled for all origins

**Query Parameters**: None

**Response Examples**:

✅ **200 Success**:
```json
[
  {
    "conversationId": "uuid",
    "timestamp": "ISO 8601 timestamp",
    "preview": "First message preview...",
    "language": "en | es",
    "messageCount": 5
  }
]
```

❌ **500 Internal Server Error**:
```json
{
  "error": "Failed to retrieve conversations"
}
```

**DynamoDB Integration**:

- Table: `chimes-conversations`
- Partition Key: `conversationId` (UUID)
- Sort Key: `timestamp`
- Attributes: `messages`, `language`, `userId`

**Example Response**:

```json
[
  {
    "conversationId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2025-03-25T20:15:30.000Z",
    "preview": "What is the vacation policy?",
    "language": "en",
    "messageCount": 3
  },
  {
    "conversationId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "timestamp": "2025-03-24T14:22:15.000Z",
    "preview": "¿Cuál es el horario de trabajo?",
    "language": "es",
    "messageCount": 2
  }
]
```

---

### 3. Feedback Endpoint

**POST** `/feedback` — Submit user feedback on responses

**Purpose**: Store user feedback (thumbs up/down) for analytics and model improvement

**CORS**: Enabled for all origins

**Request Body**:

```json
{
  "messageId": "string (required) - Unique message identifier",
  "rating": "string (required) - 'up' or 'down'",
  "timestamp": "number (required) - Unix timestamp in milliseconds"
}
```

**Response Examples**:

✅ **200 Success**:
```json
{
  "message": "Feedback recorded successfully",
  "feedbackId": "generated-feedback-id"
}
```

❌ **400 Bad Request**:
```json
{
  "error": "messageId, rating, and timestamp are required"
}
```

❌ **500 Internal Server Error**:
```json
{
  "error": "Failed to store feedback"
}
```

**DynamoDB Integration**:

- Table: `chimes-feedback`
- Partition Key: `feedbackId` (generated)
- Attributes: `messageId`, `rating`, `timestamp`, `userId`

**Example Request**:

```bash
curl -X POST https://api-id.execute-api.us-east-1.amazonaws.com/Prod/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "messageId": "msg-1234567890",
    "rating": "up",
    "timestamp": 1711401330000
  }'
```

---

### 4. Analytics Endpoint

**GET** `/analytics` — Retrieve dashboard analytics

**Purpose**: Get aggregated metrics for admin dashboard (conversation trends, language distribution, feedback stats)

**CORS**: Enabled for all origins

**Authentication**: Should be protected in production (currently open)

**Query Parameters**: None

**Response Examples**:

✅ **200 Success**:
```json
{
  "totalConversations": 1250,
  "totalMessages": 5432,
  "languageDistribution": {
    "en": 750,
    "es": 500
  },
  "feedbackStats": {
    "positive": 850,
    "negative": 120,
    "total": 970
  },
  "conversationTrends": [
    {
      "date": "2025-03-25",
      "count": 45
    }
  ],
  "topQuestions": [
    {
      "question": "What is the vacation policy?",
      "count": 120
    }
  ]
}
```

❌ **500 Internal Server Error**:
```json
{
  "error": "Failed to retrieve analytics"
}
```

**Metrics Provided**:

- Total conversation count
- Total message count
- Language usage breakdown (English vs Spanish)
- Positive vs negative feedback ratio
- Daily conversation trends (last 30 days)
- Most frequently asked questions
- Average response satisfaction

---

## Authentication & Security

### Current Implementation

- **API Gateway**: No authentication (open endpoints)
- **CORS**: Enabled for all origins with POST/GET/OPTIONS methods
- **Lambda Execution**: IAM role-based permissions

### Production Recommendations

⚠️ **Important**: Add authentication before production deployment:

1. **AWS Cognito User Pools**: For employee authentication
2. **API Key**: For basic access control
3. **IAM Authorization**: For service-to-service communication
4. **WAF Rules**: For rate limiting and DDoS protection

**Example Cognito Integration**:

```yaml
# In SAM template.yaml
Auth:
  DefaultAuthorizer: CognitoAuthorizer
  Authorizers:
    CognitoAuthorizer:
      UserPoolArn: !GetAtt UserPool.Arn
```

---

## Amazon Bedrock Integration

### Knowledge Base Configuration

**Knowledge Base ID**: Configured via environment variable `KNOWLEDGE_BASE_ID`

**Embedding Model**: `amazon.titan-embed-text-v1`

**Document Source**: S3 bucket containing company policy documents

**Supported Formats**: PDF, TXT, DOCX

### Model Configuration

**Primary Model**: `amazon.nova-pro-v1:0`

**Capabilities**:
- Multilingual support (English and Spanish)
- Retrieval Augmented Generation (RAG)
- Source citation
- Context-aware responses

**Model Parameters**:

```json
{
  "temperature": 0.7,
  "topP": 0.9,
  "maxTokens": 2048
}
```

### RAG (Retrieval Augmented Generation) Flow

1. **User Query Processing**:
   - Extract key entities and intent from user question
   - Apply language-specific processing

2. **Knowledge Base Retrieval**:
   - Query Bedrock Knowledge Base with processed question
   - Retrieve top K relevant document chunks (K=5)
   - Score relevance using vector similarity

3. **Response Generation**:
   - Combine retrieved context with user question
   - Generate response using Nova Pro model
   - Include source citations from retrieved documents

4. **Response Enhancement**:
   - Translate to requested language if needed
   - Format citations with document references
   - Apply safety filters

---

## Error Handling

### Standard Error Codes

| Code | Description | Example Scenario |
|------|-------------|------------------|
| 200 | Success | Request processed successfully |
| 400 | Bad Request | Missing required parameters |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Database error, Bedrock error |
| 503 | Service Unavailable | Rate limit exceeded, service down |

### Error Response Format

All errors return JSON with descriptive messages:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-03-25T20:15:30.000Z",
  "requestId": "aws-request-id"
}
```

---

## Rate Limiting & Quotas

### API Gateway Limits

- **Requests per second**: 10,000 (default)
- **Burst**: 5,000 requests
- **Payload size**: 10 MB maximum

### Bedrock Limits

- **Requests per minute**: 500 (Nova Pro)
- **Concurrent requests**: 10
- **Token limit**: 200,000 input + output tokens per request

### DynamoDB Limits

- **Read capacity**: 5 units (autoscaling enabled)
- **Write capacity**: 5 units (autoscaling enabled)
- **Item size**: 400 KB maximum

---

## Frontend Integration

### JavaScript/React Example

```javascript
// Chat request
const response = await fetch(`${process.env.VITE_API_ENDPOINT}/chat`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: userInput,
    language: selectedLanguage,
    model: 'amazon.nova-pro-v1:0',
    conversationHistory: messages.map(m => ({
      role: m.type === 'user' ? 'user' : 'assistant',
      content: m.content
    }))
  })
});

const data = await response.json();

if (data.error) {
  console.error('API Error:', data.error);
} else {
  displayMessage(data.message, data.citations);
}
```

### Feedback Submission Example

```javascript
const submitFeedback = async (messageId, rating) => {
  await fetch(`${process.env.VITE_API_ENDPOINT}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messageId,
      rating,
      timestamp: Date.now()
    })
  });
};
```

---

## Monitoring & Logging

### CloudWatch Logs

All Lambda functions log to CloudWatch:

- Log Group: `/aws/lambda/{function-name}`
- Retention: 7 days (configurable)
- Log Level: INFO, WARN, ERROR

### CloudWatch Metrics

**Custom Metrics**:
- `ConversationCount`: Total conversations per day
- `AverageResponseTime`: Lambda execution time
- `BedrockTokensUsed`: Token consumption per request
- `FeedbackRatio`: Positive vs negative feedback

**AWS Metrics**:
- Lambda invocations, errors, duration
- API Gateway 4XX, 5XX errors, latency
- DynamoDB throttles, consumed capacity

### X-Ray Tracing

Enable AWS X-Ray for distributed tracing:

```yaml
Tracing: Active  # In SAM template
```

---

## Testing

### API Testing with cURL

```bash
# Test chat endpoint
curl -X POST https://{api-id}.execute-api.us-east-1.amazonaws.com/Prod/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is the vacation policy?","language":"en","model":"amazon.nova-pro-v1:0","conversationHistory":[]}'

# Test analytics endpoint
curl https://{api-id}.execute-api.us-east-1.amazonaws.com/Prod/analytics
```

### Local Testing with SAM

```bash
# Invoke chat function locally
sam local invoke ChatFunction --event events/chat-event.json

# Start local API
sam local start-api
```

---

## Changelog

### v1.0.0 (Current)
- Initial API implementation
- Bedrock Knowledge Base integration
- Bilingual support (English/Spanish)
- Conversation history
- Feedback system
- Admin analytics

### Future Enhancements
- Authentication with AWS Cognito
- Advanced analytics and reporting
- Multi-tenant support
- Webhook integrations
- API versioning
