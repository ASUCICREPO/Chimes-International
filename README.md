# Chimes Knowledge Companion

An AI-powered internal knowledge assistant for **Chimes International** employees, supporting **English and Spanish**. Built with Amazon Bedrock Knowledge Bases, it provides instant answers to HR, IT, benefits, and policy questions — with source citations from official company documents.

| | |
|---|---|
| **Live Demo** | [main.d1an0vqq41s0dw.amplifyapp.com](https://main.d1an0vqq41s0dw.amplifyapp.com/) |
| **Frontend** | React 18 · TypeScript · Vite · Tailwind CSS v4 |
| **Backend** | AWS Lambda · Node.js 18 · API Gateway |
| **AI/ML** | Amazon Bedrock · Nova Pro · Knowledge Bases · Titan Embeddings |
| **Infrastructure** | AWS SAM · DynamoDB · S3 · Amplify Hosting |

---

## Project Structure

```
Chimes International/
├── frontend/          # React + Vite frontend application
├── backend/           # AWS Lambda backend (SAM template)
├── docs/              # Comprehensive documentation
├── deploy.sh          # Automated deployment script
├── buildspec.yml      # AWS CodeBuild CI/CD configuration
├── LICENSE            # MIT License
└── README.md          # This file
```

---

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) folder:

- **[User Guide](./docs/USER_GUIDE.md)** - How to use the application
- **[API Documentation](./docs/API_DOCUMENTATION.md)** - REST API reference
- **[Architecture](./docs/ARCHITECTURE.md)** - System design and patterns
- **[Infrastructure](./docs/INFRASTRUCTURE.md)** - AWS services and deployment
- **[Deployment Guide](./DEPLOYMENT.md)** - How to deploy the application

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌───────────────────┐
│   React UI  │────▶│  API Gateway │────▶│   Lambda (Chat)   │
│  (Amplify)  │◀────│    (REST)    │◀────│                   │
└─────────────┘     └──────────────┘     └────────┬──────────┘
                                                  │
                                    ┌─────────────▼──────────────┐
                                    │   Amazon Bedrock            │
                                    │   ┌──────────────────────┐  │
                                    │   │  Knowledge Base       │  │
                                    │   │  (Titan Embeddings)   │  │
                                    │   └──────────┬───────────┘  │
                                    │              │              │
                                    │   ┌──────────▼───────────┐  │
                                    │   │  Nova Pro (LLM)       │  │
                                    │   └──────────────────────┘  │
                                    └─────────────────────────────┘
                                                  │
                                    ┌─────────────▼──────────────┐
                                    │   DynamoDB                  │
                                    │   • chimes-conversations    │
                                    │   • chimes-feedback         │
                                    └─────────────────────────────┘
```

---

## Key Features

- **Bilingual Support** — Real-time English/Spanish toggle; responses match selected language
- **RAG with Citations** — Retrieves relevant passages from Chimes documents and cites sources
- **Conversation History** — Sidebar shows recent chat sessions, click to reload
- **Admin Dashboard** — Analytics with conversation trends, language distribution, topic breakdown, and feedback tracking
- **Feedback Loop** — Thumbs up/down on every response, stored in DynamoDB
- **Suggested Prompts** — Quick-start chips for common questions (IT help, benefits, time off, etc.)

---

## Project Structure

```
.
├── src/                          # Frontend (React + TypeScript)
│   ├── app/
│   │   ├── App.tsx               # Main chat interface
│   │   ├── AdminDashboard.tsx    # Analytics dashboard
│   │   ├── components/
│   │   │   ├── ChatMessage.tsx   # Markdown-rendered chat bubbles
│   │   │   ├── LanguageToggle.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── PromptChip.tsx
│   │   │   └── TypingIndicator.tsx
│   │   └── components/ui/        # shadcn/ui components
│   └── main.tsx
├── chimes-backend/               # Backend (AWS SAM)
│   ├── template.yaml             # SAM infrastructure-as-code
│   ├── src/handlers/
│   │   ├── chat.js               # POST /chat — RAG query + LLM response
│   │   ├── feedback.js           # POST /feedback — Store ratings
│   │   ├── analytics.js          # GET /analytics — Dashboard data
│   │   └── conversations.js      # GET /conversations — Chat history
│   └── package.json
├── public/
│   └── chimes-logo.svg
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Prerequisites

| Requirement | Details |
|---|---|
| **Node.js** | v18+ |
| **AWS CLI** | v2, configured with credentials |
| **AWS SAM CLI** | For backend deployment |
| **AWS Account** | With Bedrock model access enabled (Nova Pro, Titan Embeddings) |

---

## Deployment

### Backend

```bash
cd chimes-backend
npm install
sam build
sam deploy --guided
```

During guided deploy:
- **Stack name:** `chimes-knowledge-companion`
- **Region:** `us-east-1`
- **KnowledgeBaseId:** Your Bedrock KB ID

Save the API Gateway endpoint URL from the output.

### Frontend (Local)

```bash
# Create .env.local in project root
echo "VITE_API_ENDPOINT=https://your-api-id.execute-api.us-east-1.amazonaws.com/Prod" > .env.local

npm install
npm run dev
```

### Frontend (Production)

The app is hosted on **AWS Amplify**, connected to this GitHub repo. Every push to `main` triggers an automatic build and deploy.

To set up Amplify Hosting:
1. Go to AWS Amplify Console → Create new app → GitHub
2. Select this repo and `main` branch
3. Build settings: `npm run build` / output `dist`
4. Add env variable: `VITE_API_ENDPOINT` = your API endpoint
5. Deploy

---

## User Flow

1. Employee opens the app and enters their name
2. Selects language (English or Spanish)
3. Types a question or clicks a suggested prompt
4. Backend retrieves relevant document passages via Bedrock Knowledge Base
5. Nova Pro generates a contextual answer with citations
6. Response renders with markdown formatting and source references
7. Employee can rate the response (thumbs up/down)

---

## Credits

Built for the **Chimes International** CIC Innovation Challenge.

| Component | Technology |
|---|---|
| UI Framework | [React](https://react.dev) + [Tailwind CSS](https://tailwindcss.com) |
| UI Components | [shadcn/ui](https://ui.shadcn.com) |
| AI Models | [Amazon Bedrock](https://aws.amazon.com/bedrock/) |
| Hosting | [AWS Amplify](https://aws.amazon.com/amplify/) |
| Infrastructure | [AWS SAM](https://aws.amazon.com/serverless/sam/) |

---

## License

This project includes components from [shadcn/ui](https://ui.shadcn.com/) (MIT License) and photos from [Unsplash](https://unsplash.com).
