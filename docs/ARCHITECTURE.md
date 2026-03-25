# Chimes Knowledge Companion - System Architecture

This document provides a comprehensive overview of the Chimes Knowledge Companion's system architecture, design patterns, and technical implementation details.

## Table of Contents

- [High-Level Architecture](#high-level-architecture)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Technology Stack](#technology-stack)
- [Design Patterns](#design-patterns)
- [Scalability](#scalability)
- [Security Architecture](#security-architecture)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Users (Employees)                         │
└────────────────────────────┬──────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                        │
│                  Hosted on AWS Amplify                           │
│                                                                   │
│  • Bilingual UI (English/Spanish)                               │
│  • Real-time chat interface                                      │
│  • Conversation history sidebar                                  │
│  • Admin analytics dashboard                                     │
└────────────────────────────┬──────────────────────────────────────┘
                            │
                            │ REST API (HTTPS)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway (REST)                          │
│                                                                   │
│  Endpoints:                                                       │
│  • POST /chat          → Chat with AI                           │
│  • GET  /conversations → Get conversation history               │
│  • POST /feedback      → Submit user feedback                   │
│  • GET  /analytics     → Get dashboard metrics                  │
└────────────────────────────┬──────────────────────────────────────┘
                            │
                            │ Invocation
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AWS Lambda Functions                          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │     Chat     │  │Conversations │  │   Feedback   │         │
│  │   Handler    │  │   Handler    │  │   Handler    │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│  ┌──────────────┐         │                  │                  │
│  │  Analytics   │         │                  │                  │
│  │   Handler    │         │                  │                  │
│  └──────┬───────┘         │                  │                  │
└─────────┼─────────────────┼──────────────────┼──────────────────┘
          │                 │                  │
          │                 │                  │
          ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Data Layer                                 │
│                                                                   │
│  ┌────────────────────────┐    ┌────────────────────────┐      │
│  │   Amazon Bedrock       │    │      DynamoDB          │      │
│  │                        │    │                        │      │
│  │  • Nova Pro (LLM)     │    │  • Conversations       │      │
│  │  • Knowledge Base     │    │  • Feedback            │      │
│  │  • Titan Embeddings   │    │                        │      │
│  └────────────────────────┘    └────────────────────────┘      │
│                                                                   │
│  ┌────────────────────────┐                                     │
│  │      Amazon S3         │                                     │
│  │                        │                                     │
│  │  • Policy Documents    │                                     │
│  │  • HR Resources        │                                     │
│  │  • Company Handbooks   │                                     │
│  └────────────────────────┘                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Architecture

```
frontend/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # Main chat interface
│   │   ├── AdminDashboard.tsx         # Analytics dashboard
│   │   ├── AppWrapper.tsx             # Application router
│   │   └── components/
│   │       ├── ChatMessage.tsx        # Message bubble component
│   │       ├── LanguageToggle.tsx     # EN/ES switcher
│   │       ├── PromptChip.tsx         # Suggested question chips
│   │       ├── TypingIndicator.tsx    # Loading animation
│   │       └── ui/                    # Reusable UI components
│   └── styles/
│       └── index.css                  # Global styles (Tailwind)
├── public/
│   └── chimes-logo.svg               # Company branding
└── package.json                       # Dependencies
```

**Key Frontend Technologies:**
- **React 18**: UI framework with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tooling
- **Tailwind CSS v4**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Radix UI**: Accessible component primitives

**State Management Pattern:**
```typescript
// Local component state with React hooks
const [messages, setMessages] = useState<Message[]>([]);
const [inputText, setInputText] = useState('');
const [language, setLanguage] = useState<'en' | 'es'>('en');
const [isTyping, setIsTyping] = useState(false);

// No global state management (Redux/Zustand) needed
// Simple prop drilling for shared state
```

---

### Backend Architecture

```
backend/
├── src/
│   └── handlers/
│       ├── chat.js            # POST /chat - AI conversation
│       ├── conversations.js   # GET /conversations - History
│       ├── feedback.js        # POST /feedback - User feedback
│       └── analytics.js       # GET /analytics - Dashboard data
├── template.yaml              # SAM infrastructure definition
└── package.json               # Node.js dependencies
```

**Lambda Handler Pattern:**

```javascript
// Standard Lambda handler structure
exports.handler = async (event) => {
  try {
    // 1. Parse and validate input
    const body = JSON.parse(event.body);

    // 2. Business logic
    const result = await processRequest(body);

    // 3. Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result)
    };
  } catch (error) {
    // 4. Error handling
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

---

## Data Flow

### Chat Flow (End-to-End)

```
1. User Input
   └─> User types question: "What is the vacation policy?"

2. Frontend Processing
   └─> React component captures input
   └─> Validates input (non-empty)
   └─> Adds to message history
   └─> Shows typing indicator

3. API Request
   └─> POST /chat with:
       {
         message: "What is the vacation policy?",
         language: "en",
         model: "amazon.nova-pro-v1:0",
         conversationHistory: [...]
       }

4. API Gateway
   └─> Validates request format
   └─> Routes to ChatFunction Lambda
   └─> Applies CORS headers

5. Lambda Processing (Chat Handler)
   └─> Parses request body
   └─> Extracts message, language, conversation history
   └─> Calls Bedrock Knowledge Base

6. Amazon Bedrock Knowledge Base
   └─> Embeds query using Titan Embeddings
   └─> Searches vector database for relevant documents
   └─> Retrieves top 5 matching document chunks
   └─> Returns chunks with similarity scores

7. Amazon Bedrock Nova Pro
   └─> Receives query + retrieved context
   └─> Generates contextual answer
   └─> Formats response in requested language
   └─> Includes source citations

8. Lambda Response Processing
   └─> Formats Bedrock response
   └─> Extracts citations
   └─> Structures JSON response

9. API Gateway Response
   └─> Returns JSON to frontend
   └─> Applies CORS headers

10. Frontend Rendering
    └─> Receives response
    └─> Hides typing indicator
    └─> Renders AI message with citations
    └─> Updates conversation history
    └─> Shows feedback buttons
```

### Feedback Flow

```
1. User clicks thumbs up/down
   └─> Frontend captures feedback event

2. API Request
   └─> POST /feedback with:
       {
         messageId: "msg-1234567890",
         rating: "up",
         timestamp: 1711401330000
       }

3. Lambda Processing (Feedback Handler)
   └─> Validates input
   └─> Generates unique feedback ID
   └─> Stores in DynamoDB

4. DynamoDB Write
   └─> Table: chimes-feedback
   └─> Item: {
         feedbackId: "fb-xyz",
         messageId: "msg-1234567890",
         rating: "up",
         timestamp: 1711401330000
       }

5. Response
   └─> Returns success to frontend
   └─> Frontend updates UI (highlights selected button)
```

---

## Technology Stack

### Frontend Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | React 18 | UI rendering and component architecture |
| Language | TypeScript | Type safety and developer experience |
| Build Tool | Vite | Fast development server and builds |
| Styling | Tailwind CSS v4 | Utility-first CSS framework |
| UI Components | Radix UI | Accessible, unstyled component primitives |
| Animations | Framer Motion | Smooth, declarative animations |
| Markdown | react-markdown | Render AI responses with formatting |
| Icons | Lucide React | Consistent icon set |
| Hosting | AWS Amplify | Static site hosting with CI/CD |

### Backend Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Compute | AWS Lambda | Serverless function execution |
| API | API Gateway (REST) | HTTP API endpoints |
| IaC | AWS SAM | Infrastructure as Code |
| Runtime | Node.js 18 | JavaScript execution environment |
| AI/ML | Amazon Bedrock | AI model access (Nova Pro) |
| Vector Search | Bedrock Knowledge Base | Retrieval Augmented Generation (RAG) |
| Embeddings | Titan Text Embeddings | Document vectorization |
| Database | DynamoDB | NoSQL data persistence |
| Storage | S3 | Document storage |
| Monitoring | CloudWatch | Logs and metrics |

---

## Design Patterns

### 1. Serverless Architecture Pattern

**Implementation**: AWS Lambda + API Gateway

**Benefits**:
- No server management
- Automatic scaling
- Pay-per-use pricing
- Built-in high availability

**Example**:
```yaml
# SAM template.yaml
ChatFunction:
  Type: AWS::Serverless::Function
  Properties:
    Handler: src/handlers/chat.handler
    Runtime: nodejs18.x
    Events:
      ChatApi:
        Type: Api
        Properties:
          Path: /chat
          Method: post
```

### 2. Retrieval Augmented Generation (RAG)

**Implementation**: Bedrock Knowledge Base + Nova Pro

**Flow**:
1. User query → Embed with Titan
2. Vector search in Knowledge Base
3. Retrieve relevant documents
4. Combine query + context
5. Generate answer with Nova Pro

**Benefits**:
- Reduces hallucinations
- Provides source citations
- Uses company-specific knowledge
- No model fine-tuning needed

### 3. Event-Driven Architecture

**Implementation**: DynamoDB Streams (future), EventBridge (future)

**Potential Use Cases**:
- Trigger notifications on new conversations
- Aggregate analytics asynchronously
- Audit log processing

### 4. Component-Based UI

**Implementation**: React components with clear separation

**Structure**:
```typescript
// Container component (logic)
function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const sendMessage = async (text) => { /* logic */ };

  return <ChatMessageList messages={messages} onSend={sendMessage} />;
}

// Presentational component (UI only)
function ChatMessageList({ messages, onSend }) {
  return (
    <div>
      {messages.map(msg => <ChatMessage key={msg.id} {...msg} />)}
    </div>
  );
}
```

---

## Scalability

### Horizontal Scaling

**Lambda Auto-Scaling**:
- Concurrent executions: 1000 (default, increasable)
- Scales automatically with load
- Stateless design enables infinite scaling

**API Gateway**:
- 10,000 requests/second (default)
- Supports burst traffic
- Regional endpoints for low latency

**DynamoDB**:
- On-demand pricing mode (automatic scaling)
- Or provisioned with auto-scaling policies
- Handles millions of requests/second

### Vertical Scaling

**Lambda Memory Configuration**:
```yaml
Properties:
  MemorySize: 512  # MB (128-10240)
  Timeout: 30      # seconds (1-900)
```

Higher memory = more CPU power

### Caching Strategy

**Frontend Caching**:
- Conversation history cached in React state
- API responses cached in browser (future)

**Backend Caching** (Future Enhancement):
- ElastiCache for frequent queries
- CloudFront for static assets
- Bedrock response caching

---

## Security Architecture

### Data Security

**In Transit**:
- HTTPS/TLS 1.2+ for all API calls
- Encrypted WebSocket connections (if added)

**At Rest**:
- DynamoDB encryption enabled by default
- S3 server-side encryption (SSE-S3)
- Bedrock data encryption

### IAM Permissions

**Principle of Least Privilege**:

```yaml
# Lambda execution role
LambdaExecutionRole:
  Policies:
    - Version: '2012-10-17'
      Statement:
        - Effect: Allow
          Action:
            - bedrock:InvokeModel
            - bedrock:Retrieve
          Resource:
            - !Sub 'arn:aws:bedrock:${AWS::Region}:${AWS::AccountId}:*'
        - Effect: Allow
          Action:
            - dynamodb:PutItem
            - dynamodb:GetItem
            - dynamodb:Query
          Resource:
            - !GetAtt ConversationsTable.Arn
            - !GetAtt FeedbackTable.Arn
```

### Network Security

**VPC Integration** (Optional):
- Lambda can run in private subnets
- Access RDS/ElastiCache securely
- NAT Gateway for external API calls

**API Gateway Security**:
- Resource policies for IP whitelisting (optional)
- API keys for rate limiting (optional)
- AWS WAF for DDoS protection (recommended)

### Authentication Roadmap

**Current**: No authentication (MVP)

**Recommended**:
1. AWS Cognito User Pools for employee SSO
2. JWT token validation in API Gateway
3. Role-based access control (RBAC)

---

## Monitoring & Observability

### Logging Architecture

```
Application Logs
      ↓
CloudWatch Logs
      ↓
Log Groups:
  - /aws/lambda/chimes-chat
  - /aws/lambda/chimes-feedback
  - /aws/lambda/chimes-analytics
  - /aws/api-gateway/chimes-api
```

### Metrics

**Custom Metrics**:
- Conversation count per hour
- Average Bedrock token usage
- Response generation time
- Feedback sentiment ratio

**AWS Metrics**:
- Lambda invocations, errors, throttles
- API Gateway 4XX/5XX errors
- DynamoDB read/write throughput

### Tracing

**AWS X-Ray** (when enabled):
- End-to-end request tracing
- Service map visualization
- Performance bottleneck identification

---

## Future Architecture Enhancements

### Phase 2: Enterprise Features
- Multi-tenant support (department-specific knowledge bases)
- Advanced analytics with Amazon QuickSight
- Real-time notifications with WebSocket API
- Document upload and processing pipeline

### Phase 3: Advanced AI
- Multi-modal support (images, charts)
- Proactive suggestions based on user patterns
- Integration with Chimes HR systems
- Voice interface with Amazon Transcribe/Polly

### Phase 4: Platform Expansion
- Mobile applications (iOS/Android)
- Slack/Teams integration
- API marketplace for third-party integrations
- White-label deployment for other organizations
