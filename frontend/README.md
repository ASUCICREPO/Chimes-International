# Frontend

React + TypeScript + Vite frontend for the Knowledge Companion.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS v4** for styling
- **Framer Motion** for animations
- **Radix UI** for accessible components

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Update .env.local with your API endpoint
# VITE_API_ENDPOINT=https://your-api-id.execute-api.us-east-1.amazonaws.com/Prod
```

### Development

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
# Build for production
npm run build
```

The production build will be in the `dist/` folder.

## Environment Variables

Create a `.env.local` file with the following variables:

```env
VITE_API_ENDPOINT=https://your-api-gateway-url.amazonaws.com/Prod
VITE_AWS_REGION=us-east-1
```

See `.env.example` for a template.

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Main application components
│   │   ├── components/         # Reusable components
│   │   ├── AdminDashboard.tsx  # Analytics dashboard
│   │   ├── App.tsx             # Main chat interface
│   │   └── AppWrapper.tsx      # App wrapper with routing
│   ├── styles/                 # Global styles
│   └── vite-env.d.ts          # TypeScript environment definitions
├── public/                     # Static assets
├── index.html                  # HTML entry point
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

## Key Features

- Bilingual chat interface (English/Spanish)
- Real-time conversation history
- Source citations for AI responses
- Feedback system (thumbs up/down)
- Admin analytics dashboard
- Responsive design

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
