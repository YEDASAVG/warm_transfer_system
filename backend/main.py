from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import time
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import our modules
from config import settings
from models import (
    RoomCreateRequest, 
    RoomCreateResponse, 
    TransferRequest, 
    TransferResponse,
    TranscriptionRequest,
    TranscriptionResponse,
    HealthResponse
)
from services import LiveKitService, LLMService, TransferService, TranscriptionService

# Initialize FastAPI app
app = FastAPI(
    title="Warm Transfer System API",
    description="Real-time warm call transfer with AI-powered summaries",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
livekit_service = LiveKitService()
llm_service = LLMService()
transcription_service = TranscriptionService()
transfer_service = TransferService(livekit_service, llm_service)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="Warm Transfer System is running",
        timestamp=datetime.now()
    )


@app.post("/create-room", response_model=RoomCreateResponse)
async def create_room(request: RoomCreateRequest):
    """Create a new LiveKit room and generate participant token"""
    try:
        # Create room
        room_id = await livekit_service.create_room(request.room_name)
        
        # Generate token
        token = livekit_service.generate_token(
            room_id, 
            request.participant_name, 
            request.role
        )
        
        return RoomCreateResponse(
            room_id=room_id,
            token=token,
            ws_url=settings.livekit_ws_url,
            expires_at=int(time.time()) + 3600  # 1 hour
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create room: {str(e)}")


@app.post("/join-room")
async def join_room(request: RoomCreateRequest):
    """Generate token to join existing room"""
    try:
        token = livekit_service.generate_token(
            request.room_name,
            request.participant_name,
            request.role
        )
        
        return {
            "token": token,
            "ws_url": settings.livekit_ws_url,
            "room_id": request.room_name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to join room: {str(e)}")


@app.post("/transfer", response_model=TransferResponse)
async def initiate_transfer(request: TransferRequest):
    """Initiate warm transfer with AI summary"""
    try:
        result = await transfer_service.initiate_transfer(
            request.caller_room_id,
            request.agent_a_id,
            request.transcript  # Real transcript instead of mock
        )
        
        return TransferResponse(
            transfer_id=result["transfer_id"],
            transfer_room_id=result["transfer_room_id"],
            agent_a_token=result["agent_a_token"],
            agent_b_token=result["agent_b_token"],
            summary=result["summary"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transfer failed: {str(e)}")


@app.get("/rooms/{room_id}/participants")
async def get_room_participants(room_id: str):
    """Get participants in a room"""
    try:
        participants = await livekit_service.get_participants(room_id)
        return {"participants": participants}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get participants: {str(e)}")


@app.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(request: TranscriptionRequest):
    """Transcribe audio data using OpenAI Whisper API"""
    try:
        result = await transcription_service.transcribe_audio(
            request.audio_data,
            request.audio_format
        )
        
        return TranscriptionResponse(
            transcript=result["transcript"],
            speaker_id=request.speaker_id,
            confidence=result["confidence"],
            timestamp=datetime.now(),
            processing_time=result.get("processing_time", 0.0),
            language=result.get("language", "en")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Warm Transfer System API",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    
    # Check if environment variables are set
    required_vars = ["LIVEKIT_API_KEY", "LIVEKIT_API_SECRET", "OPENAI_API_KEY"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease copy .env.example to .env and add your API keys.")
        exit(1)
    
    print("🚀 Starting Warm Transfer System Backend...")
    print("📝 API Documentation: http://localhost:8000/docs")
    print("❤️  Health Check: http://localhost:8000/health")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )