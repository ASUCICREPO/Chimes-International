<div align="center">

# 🔔 Chimes Knowledge Companion

### AI-Powered Internal Knowledge Assistant

An intelligent, bilingual assistant for Chimes International employees, providing instant answers to HR, IT, benefits, and policy questions with source citations from official company documents.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://main.d1an0vqq41s0dw.amplifyapp.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![AWS](https://img.shields.io/badge/AWS-Bedrock-orange)](https://aws.amazon.com/bedrock/)

[Live Demo](https://main.d1an0vqq41s0dw.amplifyapp.com/) • [Documentation](./docs/) • [Deployment Guide](./DEPLOYMENT.md)

</div>

---

## ✨ Key Features

🌐 **Bilingual Support** — Seamless English/Spanish toggle with language-matched responses  
📚 **RAG with Citations** — Retrieves and cites relevant passages from official documents  
💬 **Conversation History** — Persistent chat sessions accessible from sidebar  
📊 **Admin Dashboard** — Real-time analytics, trends, and feedback tracking  
👍 **Feedback System** — Rate responses to continuously improve accuracy  
⚡ **Smart Prompts** — Quick-start suggestions for common employee questions

---

## 🏗️ Architecture

```
┌─────────────────┐
│   React UI      │  ← User Interface (Amplify Hosting)
│   TypeScript    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Gateway    │  ← REST API
│  (AWS)          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────────┐
│  Lambda         │────▶│  Amazon Bedrock      │
│  Functions      │     │  • Nova Pro (LLM)    │
│  (Node.js 18)   │     │  • Knowledge Base    │
└────────┬────────┘     │  • Titan Embeddings  │
         │              └──────────────────────┘
         ▼
┌─────────────────┐
│  DynamoDB       │  ← Conversations & Feedback
│  Tables         │
└─────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- AWS CLI v2 (configured)
- AWS SAM CLI
- AWS Account with Bedrock access (Nova Pro, Titan Embeddings)

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/ASUCICREPO/Chimes-International.git
cd "Chimes International"

# 2. Deploy backend
cd backend
npm install
sam build
sam deploy --guided

# 3. Configure frontend
cd ../frontend
echo "VITE_API_ENDPOINT=<your-api-gateway-url>" > .env.local

# 4. Start development server
npm install
npm run dev
```

Visit `http://localhost:5173` to see the app running locally.

---

## 📁 Project Structure

```
Chimes-International/
├── frontend/                    # React + TypeScript + Vite
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx         # Main chat interface
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── components/     # Reusable UI components
│   │   └── styles/             # Global styles & themes
│   ├── public/                 # Static assets
│   ├── amplify.yml             # AWS Amplify config
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
│
├── backend/                     # AWS SAM serverless backend
│   ├── src/handlers/
│   │   ├── chat.js            # RAG + LLM response
│   │   ├── conversations.js   # Chat history
│   │   ├── feedback.js        # User ratings
│   │   └── analytics.js       # Dashboard metrics
│   ├── template.yaml          # SAM infrastructure
│   ├── package.json
│   └── README.md
│
├── docs/                       # Comprehensive documentation
│   ├── README.md
│   ├── API_DOCUMENTATION.md
│   ├── ARCHITECTURE.md
│   ├── INFRASTRUCTURE.md
│   └── USER_GUIDE.md
│
├── deploy.sh                   # Automated deployment script
├── buildspec.yml              # AWS CodeBuild CI/CD config
├── DEPLOYMENT.md              # Deployment guide
├── LICENSE                    # MIT License
└── README.md                  # This file
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI
- **Hosting:** AWS Amplify

### Backend
- **Runtime:** Node.js 18
- **Framework:** AWS SAM (Serverless Application Model)
- **API:** Amazon API Gateway (REST)
- **Compute:** AWS Lambda
- **Database:** Amazon DynamoDB

### AI/ML
- **LLM:** Amazon Bedrock Nova Pro
- **Embeddings:** Amazon Titan Embeddings
- **RAG:** Amazon Bedrock Knowledge Bases

---

## 📖 Documentation

Comprehensive guides are available in the [`docs/`](./docs/) directory:

| Document | Description |
|----------|-------------|
| [User Guide](./docs/USER_GUIDE.md) | How to use the application |
| [API Documentation](./docs/API_DOCUMENTATION.md) | REST API endpoints and schemas |
| [Architecture](./docs/ARCHITECTURE.md) | System design and patterns |
| [Infrastructure](./docs/INFRASTRUCTURE.md) | AWS services and configuration |
| [Deployment Guide](./DEPLOYMENT.md) | Step-by-step deployment instructions |

---

## 🔄 User Flow

1. **Login** — Employee enters name and selects language preference
2. **Ask** — Type a question or select a suggested prompt
3. **Retrieve** — Backend queries Bedrock Knowledge Base for relevant documents
4. **Generate** — Nova Pro creates contextual answer with citations
5. **Display** — Response renders with markdown formatting and sources
6. **Feedback** — Rate the response to improve future answers

---

## 🚢 Deployment

### Backend Deployment

```bash
cd backend
sam build
sam deploy --guided
```

Configuration prompts:
- Stack name: `chimes-knowledge-companion`
- Region: `us-east-1`
- KnowledgeBaseId: `<your-bedrock-kb-id>`

### Frontend Deployment (AWS Amplify)

1. Connect repository to AWS Amplify Console
2. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Add environment variable: `VITE_API_ENDPOINT`
4. Deploy automatically on push to `main`

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

---

---

## 🤝 Contributing

This project was built for the Chimes International CIC Innovation Challenge. Contributions are welcome!

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

Built with:
- [React](https://react.dev) — UI framework
- [Tailwind CSS](https://tailwindcss.com) — Styling
- [Radix UI](https://www.radix-ui.com/) — UI components
- [Amazon Bedrock](https://aws.amazon.com/bedrock/) — AI/ML platform
- [AWS Amplify](https://aws.amazon.com/amplify/) — Hosting
- [AWS SAM](https://aws.amazon.com/serverless/sam/) — Infrastructure

---

<div align="center">

**Made for Chimes International**

</div>
