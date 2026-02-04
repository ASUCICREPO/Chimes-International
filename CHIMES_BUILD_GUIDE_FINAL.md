# 🚀 CHIMES BUILD GUIDE - FINAL
## Using Claude CLI + Antigravity Multi-Agent System

**IMPORTANT:** This guide consolidates everything into ONE file. No scattered MD files.

---

## 📋 PART 1: Quick Setup Checklist

### Prerequisites (Answer these first):

1. **Antigravity Access**
   - [ ] I have Antigravity installed
   - [ ] I can switch between models (Gemini 3 Pro, Claude Sonnet 4.5)
   - [ ] I'm using: ☐ Antigravity IDE  ☐ Claude CLI via proxy

2. **AWS**
   - [ ] AWS account: `538494148436`
   - [ ] AWS CLI configured
   - [ ] Region set to: `us-east-1`

3. **Documents**
   - [ ] Chimes documents location: `________________`
   - [ ] Format: ☐ PDF  ☐ Other

4. **Frontend**
   - [ ] Frontend code location: `________________`
   - [ ] Can run `npm run dev`: ☐ Yes  ☐ No

**→ Tell me your answers, then we proceed**

---

## 🎯 PART 2: Project Facts (NO HALLUCINATIONS)

### What We're Building:
- ✅ FAQ answering chatbot
- ✅ English + Spanish
- ✅ Citations to source docs
- ✅ Knowledge Base from Chimes documents

### What We're NOT Building:
- ❌ File upload
- ❌ Admin dashboard  
- ❌ User auth
- ❌ SharePoint sync (unless you have credentials)

### Tech Stack (ACTUAL):
```
Frontend: React 18 + TypeScript (DONE ✅)
Backend:  AWS Lambda + Node.js 18
AI:       Amazon Bedrock (Claude Sonnet 4)
KB:       Bedrock Knowledge Base + Titan Embeddings
Storage:  S3
API:      API Gateway
```

### AWS Details:
- Account: `538494148436`
- Region: `us-east-1` (ONLY)
- Buckets: `chimes-kb-documents-538494148436`

---

## 🤖 PART 3: Multi-Agent Strategy (Antigravity)

### Using Antigravity's Multi-Agent System:

Antigravity lets you run MULTIPLE agents simultaneously:
- **Gemini 3 Pro** - Planning, analysis, complex reasoning
- **Claude Sonnet 4.5** - Code generation, documentation
- **Agent Manager** - Orchestrate multiple agents

### Recommended Multi-Agent Workflow:

**Agent 1 (Gemini 3 Pro):** AWS infrastructure planning
**Agent 2 (Claude Sonnet 4.5):** Code generation  
**Agent 3 (Gemini 3 Pro):** Testing & verification

### How to Use:

```
In Antigravity IDE:
1. Open Agent Manager (not just chat)
2. Create 3 separate agents
3. Give each a specific job
4. Let them work in parallel
```

**Example:**
```
Agent 1 Task:
"Analyze Chimes requirements and create AWS infrastructure plan.
Output: Step-by-step Bedrock KB setup guide."

Agent 2 Task:  
"Once Agent 1 completes, write chat.js Lambda function.
Use: Bedrock KB ID from Agent 1
Output: Production-ready code."

Agent 3 Task:
"Once Agent 2 completes, create SAM template.yaml.
Include: Lambda from Agent 2, API Gateway, env vars."
```

---

## ⚡ PART 4: Anti-Hallucination Rules

### Golden Rules:

1. **Use `/clear` after each step** (in CLI mode)
2. **Provide actual facts** (KB ID, account number, file paths)
3. **One task at a time** (don't ask to "build everything")
4. **Challenge wrong answers** (if it sounds wrong, IT IS)
5. **Verify with AWS docs** (always ask for documentation links)

### Good Prompt Template:

```
Context:
- Project: Chimes Knowledge Companion
- AWS Account: 538494148436
- Region: us-east-1
- Tech: [specify what's relevant]

Task: [ONE specific thing]

Requirements:
- [Specific requirement 1]
- [Specific requirement 2]

Output:
- [What format you want]
- Include AWS docs link

Don't:
- [Things NOT to do]
```

### Bad vs Good Examples:

❌ **BAD:** "Build the backend"

✅ **GOOD:** 
```
Context:
- Project: Chimes chatbot
- AWS: 538494148436, us-east-1
- KB ID: kb-ABC123 (I'll provide when ready)

Task: Create ONE Lambda function file

Requirements:
- File: src/handlers/chat.js
- Runtime: Node.js 18
- Input: {message: string, language: 'en'|'es'}
- Action: Query Bedrock KB, return response
- Dependencies: @aws-sdk/client-bedrock-agent-runtime

Output:
- Complete chat.js file
- No other files
- Include comments

Don't:
- Create template.yaml yet
- Add file upload
- Include admin features
```

---

## 🏗️ PART 5: Implementation Steps

### Phase 1: AWS Console Setup (Manual)

**Step 1.1: Enable Bedrock Models**
```
AWS Console → Bedrock → Model access → Enable:
- Claude Sonnet 4 (anthropic.claude-sonnet-4-20250514)
- Titan Embeddings G1 (amazon.titan-embed-text-v1)
```

**Step 1.2: Create S3 Buckets**
```
AWS Console → S3 → Create bucket:
Name: chimes-kb-documents-538494148436
Region: us-east-1
Block public access: ✅ ON
Versioning: ✅ ON
```

**Step 1.3: Upload Documents**
```bash
aws s3 sync /your/documents/ s3://chimes-kb-documents-538494148436/hr/
aws s3 sync /your/it-docs/ s3://chimes-kb-documents-538494148436/it/
```

**Step 1.4: Create Knowledge Base**
```
AWS Console → Bedrock → Knowledge bases → Create:
Name: chimes-internal-kb
Data source: s3://chimes-kb-documents-538494148436/
Embeddings: Titan Embeddings G1
Vector DB: OpenSearch Serverless (auto-create)
→ Click Sync after creation
→ SAVE THE KB ID: kb-XXXXXXXXXXXX
```

---

### Phase 2: Backend Code (Use Agents)

**Directory Structure:**
```
chimes-backend/
├── src/handlers/chat.js    ← ONLY file we need
├── template.yaml            ← SAM config
├── package.json
└── .env
```

**File 1: src/handlers/chat.js** (Agent generates this)

```javascript
// Agent prompt:
"Create src/handlers/chat.js Lambda function.

Requirements:
- Runtime: Node.js 18
- Handler: exports.handler
- Input: {message: string, language: 'en'|'es', history?: array}
- Process: 
  1. Query Bedrock KB (use RetrieveCommand)
  2. Call Claude Sonnet 4 with context
  3. Return {message: string, citations: array}
- Dependencies: 
  @aws-sdk/client-bedrock-runtime
  @aws-sdk/client-bedrock-agent-runtime
- Env vars: KNOWLEDGE_BASE_ID, AWS_REGION
- Error handling: Try-catch, log errors
- Comments: Inline explanations

Output: Complete working code, no placeholders."
```

**File 2: template.yaml** (Agent generates this)

```javascript
// Agent prompt:
"Create SAM template.yaml.

Requirements:
- One Lambda: ChatFunction
- Runtime: nodejs18.x
- Handler: src/handlers/chat.handler
- Timeout: 30s
- Memory: 512MB
- Environment variables:
  - KNOWLEDGE_BASE_ID
  - AWS_REGION=us-east-1
- Permissions:
  - bedrock:InvokeModel
  - bedrock:Retrieve
- API Gateway:
  - POST /chat
  - CORS enabled
- Outputs: API endpoint URL

Output: Complete SAM template, valid YAML."
```

**File 3: package.json** (Agent generates this)

```javascript
// Agent prompt:
"Create package.json for Lambda.

Dependencies:
- @aws-sdk/client-bedrock-runtime: ^3.x
- @aws-sdk/client-bedrock-agent-runtime: ^3.x

Scripts:
- None needed (SAM builds)

Output: Minimal valid package.json."
```

---

### Phase 3: Deploy (CLI Commands)

```bash
# 1. Install dependencies
cd chimes-backend
npm install

# 2. Build with SAM
sam build

# 3. Deploy
sam deploy --guided

# During prompts:
Stack name: chimes-knowledge-companion
Region: us-east-1
Parameter KnowledgeBaseId: kb-XXXXXXXXXXXX
Confirm changes: y
Allow IAM role creation: y
Save settings: y

# 4. Get API endpoint from output
# Save this URL: https://xxxxxx.execute-api.us-east-1.amazonaws.com/Prod/
```

---

### Phase 4: Frontend Connection

**Update frontend .env:**
```bash
VITE_API_ENDPOINT=https://your-api-url/Prod
VITE_AWS_REGION=us-east-1
```

**Update App.tsx** (Agent does this):

```javascript
// Agent prompt:
"Update src/app/App.tsx to call real API.

Current: handleSendMessage has mock responses
Change to: Call ${VITE_API_ENDPOINT}/chat

Requirements:
- Fetch POST to API endpoint
- Send {message, language, conversationHistory}
- Handle response {message, citations}
- Update state with real response
- Error handling with fallback
- Loading state
- Keep existing UI

Output: Only show the handleSendMessage function changes."
```

---

### Phase 5: Test

```bash
# 1. Start frontend
cd chimes-frontend
npm run dev

# 2. Open http://localhost:5173
# 3. Test:
✅ Ask question in English
✅ Ask question in Spanish  
✅ Verify citations appear
✅ Check error handling
```

---

## 🔥 PART 6: Best Coding Practices

### Code Quality Rules:

1. **No commented-out code** - Delete it, use git
2. **No TODO comments** - Fix it or track in issues
3. **No console.log in production** - Use proper logging
4. **Handle ALL errors** - Try-catch everything
5. **Use environment variables** - Never hardcode
6. **Validate inputs** - Check before processing
7. **Return consistent formats** - Same structure every time

### File Organization:

```
✅ GOOD (Minimal files):
chimes-backend/
├── src/handlers/chat.js  
├── template.yaml
├── package.json
└── .env

❌ BAD (Too many files):
chimes-backend/
├── src/
│   ├── handlers/
│   │   ├── chat.js
│   │   ├── upload.js (not needed)
│   │   ├── feedback.js (not needed)
│   ├── lib/
│   │   ├── bedrock.js (unnecessary abstraction)
│   │   ├── prompts.js (unnecessary abstraction)
│   ├── utils/
│   │   ├── validation.js (premature)
│   │   ├── logger.js (premature)
├── docs/ (not needed yet)
├── tests/ (not needed for MVP)
└── scripts/ (not needed yet)
```

**Why:** Keep it simple. Add complexity when NEEDED, not preemptively.

### Code Style:

```javascript
// ✅ GOOD
async function queryKnowledgeBase(query, kbId) {
  try {
    const command = new RetrieveCommand({
      knowledgeBaseId: kbId,
      retrievalQuery: { text: query },
      retrievalConfiguration: {
        vectorSearchConfiguration: {
          numberOfResults: 5
        }
      }
    });
    
    const response = await bedrockAgent.send(command);
    return response.retrievalResults;
  } catch (error) {
    console.error('KB query failed:', error);
    throw new Error('Failed to query knowledge base');
  }
}

// ❌ BAD (over-engineered)
class KnowledgeBaseService {
  constructor(config) {
    this.config = config;
    this.client = new BedrockAgentClient();
    this.logger = new Logger();
    this.metrics = new MetricsCollector();
  }
  
  async query(params) {
    this.logger.info('Starting query');
    this.metrics.increment('queries');
    // ... unnecessary complexity
  }
}
```

**Why:** Simple functions > Classes for Lambda. Less code = fewer bugs.

---

## 🚨 PART 7: Common Issues & Fixes

### Issue: "Bedrock access denied"
```
Fix:
1. Check you're in us-east-1
2. Verify model access in console
3. Check IAM permissions in template.yaml
4. Wait 5 mins, try again
```

### Issue: "Knowledge Base empty results"
```
Fix:
1. Check KB sync completed
2. Verify S3 bucket has files
3. Test with simple query: "What is Chimes?"
4. Check CloudWatch logs
```

### Issue: "API Gateway timeout"
```
Fix:
1. Increase Lambda timeout to 30s in template.yaml
2. Check Lambda has internet access (VPC config)
3. Verify KB ID is correct in environment
```

### Issue: "CORS errors"
```
Fix: Add to template.yaml:
Cors:
  AllowOrigin: "'*'"
  AllowHeaders: "'Content-Type,Authorization'"
  AllowMethods: "'POST,OPTIONS'"
```

---

## 📊 PART 8: Minimal Documentation Strategy

### ONLY Create These Files:

1. **README.md** (project root) - Basic setup instructions
2. **This guide** (for development reference)
3. **DONE** - No more MD files!

### What NOT to create:

- ❌ CONTRIBUTING.md (not needed yet)
- ❌ ARCHITECTURE.md (keep it in code comments)
- ❌ API.md (use OpenAPI spec if needed)
- ❌ DEPLOYMENT.md (use SAM docs)
- ❌ TESTING.md (write tests instead of docs)
- ❌ Multiple context files (just this one)

### Documentation Philosophy:

**Good docs:** Code + inline comments + README
**Bad docs:** 15 MD files that get outdated

**Example README.md:**
```markdown
# Chimes Knowledge Companion

Internal chatbot for Chimes employees.

## Setup
```bash
npm install
sam build
sam deploy --guided
```

## Environment
```
KNOWLEDGE_BASE_ID=kb-XXX
AWS_REGION=us-east-1
```

## Development
```bash
npm run dev  # Frontend
sam local start-api  # Backend
```

That's it.
```

---

## 🎯 PART 9: Success Checklist

**Done when:**
- [ ] User asks in English → Gets answer
- [ ] User asks in Spanish → Gets answer in Spanish
- [ ] Answers include citations
- [ ] Deployed to AWS
- [ ] Frontend connected
- [ ] No console errors

**Not required:**
- [ ] Perfect UI animations
- [ ] Admin features
- [ ] File upload
- [ ] 100% test coverage

---

## 📞 PART 10: Using This Guide

### With Claude CLI:
```bash
# Copy this entire guide content
# Then:

/clear

"Read the guide I provided.
We're at Phase [X], Step [Y].
[Specific question about that step].
Provide exact commands and AWS docs link."

# Do the step
/clear

# Next step
"Read the guide. Now Phase [X], Step [Y+1]..."
```

### With Antigravity Multi-Agent:
```
Agent 1 (Gemini 3 Pro):
"Read the guide. Create infrastructure plan for Phase 1.
Output: Artifact with step-by-step AWS console clicks."

Agent 2 (Claude Sonnet 4.5):
"Read the guide. Once Agent 1 completes,
generate Phase 2 code files.
Output: Complete working code."

Agent 3 (Gemini 3 Pro):
"Read the guide. Once Agent 2 completes,
verify code quality and create deployment plan.
Output: Artifact with validation results."
```

---

## 🔗 Official Resources

- **Antigravity:** antigravity.google/download
- **Bedrock Docs:** docs.aws.amazon.com/bedrock/
- **Knowledge Base:** docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html
- **SAM:** docs.aws.amazon.com/serverless-application-model/
- **Chimes Contact:** Haley Gottshall (dale.goff@chimes.org)

---

## ⚡ TL;DR - Quick Start

1. Answer prerequisite questions (Part 1)
2. Follow Phase 1: AWS Console (manual setup)
3. Use agents for Phase 2: Code generation
4. Deploy Phase 3: SAM deploy
5. Connect Phase 4: Frontend integration
6. Test Phase 5: Verify it works
7. **DONE** - Ship it!

---

**Remember:**
- ✅ Simple > Complex
- ✅ Working > Perfect
- ✅ Shipping > Planning
- ✅ Facts > Assumptions
- ✅ `/clear` > Context bloat

**LET'S BUILD! 🚀**
