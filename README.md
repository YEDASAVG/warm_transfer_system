# Warm Transfer System - 10 Hour MVP

A real-time warm call transfer system using LiveKit and LLMs for seamless agent handoffs with AI-generated conversation summaries.

## Quick Start

1. **Clone & Setup**
   ```bash
   git clone <your-repo>
   cd warm-transfer-system
   ```

2. **Environment Setup**
   ```bash
   # Copy environment templates
   cp .env.example .env
   cp frontend/.env.local.example frontend/.env.local
   
   # Add your API keys to .env and frontend/.env.local
   ```

3. **Run Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```

4. **Run Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Open Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Demo Flow

1. **Go to /caller** - Join as caller
2. **Go to /agent-a** - Join as Agent A  
3. **Click "Transfer" button** - Initiate warm transfer
4. **Review AI-generated summary** - See conversation context
5. **Confirm transfer** - Complete handoff
6. **Go to /agent-b** - See successful transfer

## Features

- ✅ Real-time audio communication via LiveKit
- ✅ AI-powered conversation summarization (OpenAI + Groq fallback)
- ✅ Seamless warm transfer workflow
- ✅ Professional UI with TypeScript
- ✅ Multi-participant room management

## Tech Stack

- **Backend**: FastAPI + LiveKit + OpenAI/Groq
- **Frontend**: Next.js 15 + TypeScript + LiveKit + Zustand
- **Real-time**: LiveKit WebRTC platform
- **AI**: OpenAI GPT-4o-mini + Groq Llama-3.3-70B

## Architecture

```
Caller → Agent A → [AI Summary Generation] → Agent B
   ↓         ↓                                    ↓
Room A → Transfer Room ────────────────────→ Room B
```

## Required API Keys

- LiveKit (API Key + Secret + WebSocket URL)
- OpenAI (API Key)
- Groq (API Key)

See `.env.example` for full configuration.

## Development

Built in 10 hours as a technical assignment showcasing:
- Real-time communication expertise
- AI integration capabilities  
- Clean, scalable architecture
- Professional development practices