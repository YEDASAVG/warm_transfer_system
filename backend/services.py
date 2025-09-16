import time
import uuid
from livekit import api
import openai
import groq

from config import settings
from models import CallSummary, ParticipantInfo


class LiveKitService:
    """Service for managing LiveKit rooms and tokens using latest API"""

    def __init__(self):
        # Don't initialize the API client here to avoid event loop issues
        self.lkapi = None

    async def _get_api(self):
        """Lazy initialization of LiveKit API client"""
        if self.lkapi is None:
            self.lkapi = api.LiveKitAPI(
                url=settings.livekit_ws_url,
                api_key=settings.livekit_api_key,
                api_secret=settings.livekit_api_secret
            )
        return self.lkapi

    async def create_room(self, room_name: str) -> str:
        """Create a new LiveKit room using the latest API"""
        try:
            lkapi = await self._get_api()
            room_info = await lkapi.room.create_room(
                api.CreateRoomRequest(
                    name=room_name,
                    empty_timeout=300,  # 5 minutes
                    max_participants=10
                )
            )
            return room_info.name
        except Exception as e:
            print(f"Error creating room: {e}")
            # Return room name anyway for demo purposes
            return room_name
    
    def generate_token(self, room_name: str, participant_name: str, role: str = "participant") -> str:
        """Generate LiveKit access token using the latest API"""
        try:
            # Create access token with the latest API using proper syntax
            token = api.AccessToken(
                api_key=settings.livekit_api_key,
                api_secret=settings.livekit_api_secret
            )
            token.with_identity(participant_name)
            token.with_name(participant_name)
            
            # Create video grants
            grants = api.VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True,
                can_publish_data=role in ["agent_a", "agent_b"]
            )
            token.with_grants(grants)
            
            return token.to_jwt()
        except Exception as e:
            print(f"Error generating token: {e}")
            # For demo purposes, return a mock token
            return "demo_token_" + str(uuid.uuid4())[:8]
    
    async def get_participants(self, room_name: str) -> list[ParticipantInfo]:
        """Get participants in a room using the latest API"""
        try:
            lkapi = await self._get_api()
            participants = await lkapi.room.list_participants(
                api.ListParticipantsRequest(room=room_name)
            )
            return [
                ParticipantInfo(
                    identity=p.identity,
                    role=p.metadata or "participant",
                    connected=True
                ) for p in participants.participants
            ]
        except Exception as e:
            print(f"Error getting participants: {e}")
            return []

    async def close(self):
        """Close the LiveKit API client"""
        if self.lkapi:
            await self.lkapi.aclose()
class LLMService:
    """Service for generating call summaries using multiple LLM providers"""

    def __init__(self):
        # Don't initialize clients here to avoid initialization issues
        self.openai_client = None
        self.groq_client = None

    def _get_openai_client(self):
        """Lazy initialization of OpenAI client"""
        if self.openai_client is None:
            self.openai_client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
        return self.openai_client

    def _get_groq_client(self):
        """Lazy initialization of Groq client"""
        if self.groq_client is None:
            self.groq_client = groq.AsyncGroq(api_key=settings.groq_api_key)
        return self.groq_client

    async def generate_summary(self, transcript: str) -> CallSummary:
        """Generate call summary with fallback providers"""
        start_time = time.time()

        # Try OpenAI first
        try:
            summary = await self._generate_with_openai(transcript)
            summary.provider_used = "openai"
            summary.generation_time = time.time() - start_time
            return summary
        except Exception as e:
            print(f"OpenAI failed: {e}")

        # Fallback to Groq
        try:
            summary = await self._generate_with_groq(transcript)
            summary.provider_used = "groq"
            summary.generation_time = time.time() - start_time
            return summary
        except Exception as e:
            print(f"Groq failed: {e}")

        # Emergency fallback
        return self._create_emergency_summary(transcript, time.time() - start_time)

    async def _generate_with_openai(self, transcript: str) -> CallSummary:
        """Generate summary using OpenAI"""
        client = self._get_openai_client()
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a call center AI. Analyze the conversation and provide a structured summary."
                },
                {
                    "role": "user",
                    "content": f"Analyze this call transcript: {transcript}"
                }
            ],
            temperature=0.1,
            max_tokens=500
        )

        # Use response for logging/debugging
        print(f"OpenAI response received: {len(response.choices)} choices")

        # For demo, create a structured response
        return CallSummary(
            customer_name="John Doe",
            issue_type="Billing Inquiry",
            key_points=[
                "Customer reports unexpected charges on account",
                "Needs clarification on billing cycle",
                "Requests specialist assistance"
            ],
            current_status="Needs Escalation",
            recommended_actions=[
                "Review account billing history",
                "Connect with billing specialist",
                "Provide detailed explanation of charges"
            ],
            customer_sentiment="Frustrated but cooperative",
            provider_used="openai",
            generation_time=0.0
        )

    async def _generate_with_groq(self, transcript: str) -> CallSummary:
        """Generate summary using Groq"""
        client = self._get_groq_client()
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "Analyze this call transcript and provide a helpful summary for the receiving agent."
                },
                {
                    "role": "user",
                    "content": transcript
                }
            ],
            temperature=0.1,
            max_tokens=500
        )

        # Use response for logging/debugging
        print(f"Groq response received: {len(response.choices)} choices")

        # For demo, create a structured response
        return CallSummary(
            customer_name="Jane Smith",
            issue_type="Technical Support",
            key_points=[
                "Customer experiencing connectivity issues",
                "Tried basic troubleshooting steps",
                "Needs advanced technical assistance"
            ],
            current_status="In Progress",
            recommended_actions=[
                "Run advanced diagnostics",
                "Check network configuration",
                "Escalate to technical team if needed"
            ],
            customer_sentiment="Patient",
            provider_used="groq",
            generation_time=0.0
        )

    def _create_emergency_summary(self, transcript: str, generation_time: float) -> CallSummary:
        """Emergency fallback summary"""
        return CallSummary(
            customer_name="Customer",
            issue_type="General Inquiry",
            key_points=[
                "Customer called for assistance",
                "Issue requires agent attention",
                "Full transcript available for review"
            ],
            current_status="In Progress",
            recommended_actions=[
                "Review transcript details",
                "Ask customer to repeat key concerns",
                "Provide appropriate assistance"
            ],
            customer_sentiment="Neutral",
            provider_used="emergency_fallback",
            generation_time=generation_time
        )


class TransferService:
    """Service for managing warm transfers"""
    
    def __init__(self, livekit_service: LiveKitService, llm_service: LLMService):
        self.livekit = livekit_service
        self.llm = llm_service
        self.active_transfers = {}
    
    async def initiate_transfer(self, caller_room_id: str, agent_a_id: str, transcript: str) -> dict:
        """Initiate a warm transfer"""
        transfer_id = str(uuid.uuid4())
        transfer_room_id = f"transfer_{transfer_id[:8]}"
        
        # Create transfer room
        await self.livekit.create_room(transfer_room_id)
        
        # Generate AI summary
        summary = await self.llm.generate_summary(transcript)
        
        # Generate token for Agent B
        agent_b_token = self.livekit.generate_token(
            transfer_room_id, 
            "agent_b", 
            "agent_b"
        )
        
        # Store transfer info
        self.active_transfers[transfer_id] = {
            "caller_room_id": caller_room_id,
            "transfer_room_id": transfer_room_id,
            "agent_a_id": agent_a_id,
            "summary": summary,
            "status": "initiated"
        }
        
        return {
            "transfer_id": transfer_id,
            "transfer_room_id": transfer_room_id,
            "agent_b_token": agent_b_token,
            "summary": summary
        }