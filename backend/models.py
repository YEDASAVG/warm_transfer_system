from pydantic import BaseModel
from typing import Literal
from datetime import datetime


# Room and participant models
class RoomCreateRequest(BaseModel):
    room_name: str
    participant_name: str
    role: Literal["caller", "agent_a", "agent_b"]


class RoomCreateResponse(BaseModel):
    room_id: str
    token: str
    ws_url: str
    expires_at: int


class ParticipantInfo(BaseModel):
    identity: str
    role: str
    connected: bool


# Transfer models
class TransferRequest(BaseModel):
    caller_room_id: str
    agent_a_id: str
    transcript: str  # Real transcript from actual conversation


class CallSummary(BaseModel):
    customer_name: str
    issue_type: str
    key_points: list[str]
    current_status: str
    recommended_actions: list[str]
    customer_sentiment: str
    provider_used: str
    generation_time: float


class TransferResponse(BaseModel):
    transfer_id: str
    transfer_room_id: str
    agent_a_token: str
    agent_b_token: str
    summary: CallSummary


# Transcription models (for future real-time audio transcription)
class TranscriptionRequest(BaseModel):
    audio_data: str  # Base64 encoded audio data
    speaker_id: str  # Keep consistent with frontend
    room_id: str
    audio_format: str = "webm"  # webm, wav, mp3, etc.


class TranscriptionResponse(BaseModel):
    transcript: str
    speaker_id: str
    confidence: float
    timestamp: datetime
    processing_time: float = 0.0
    language: str = "en"


# System models
class HealthResponse(BaseModel):
    status: str
    message: str
    timestamp: datetime