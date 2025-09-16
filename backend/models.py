from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime


class RoomCreateRequest(BaseModel):
    room_name: str
    participant_name: str
    role: Literal["caller", "agent_a", "agent_b"]


class RoomCreateResponse(BaseModel):
    room_id: str
    token: str
    ws_url: str
    expires_at: int


class TransferRequest(BaseModel):
    caller_room_id: str
    agent_a_id: str
    mock_transcript: str = "Customer called about billing issue. Needs specialist help."


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
    agent_b_token: str
    summary: CallSummary


class HealthResponse(BaseModel):
    status: str
    message: str
    timestamp: datetime


class ParticipantInfo(BaseModel):
    identity: str
    role: str
    connected: bool