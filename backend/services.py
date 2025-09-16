import time
import uuid
import json
import aiohttp
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
            try:
                with open("debug_ai.log", "a") as f:
                    f.write(f"🔧 Initializing OpenAI client...\n")
                self.openai_client = openai.AsyncOpenAI(
                    api_key=settings.openai_api_key
                )
                with open("debug_ai.log", "a") as f:
                    f.write(f"✅ OpenAI client initialized successfully\n")
            except Exception as e:
                with open("debug_ai.log", "a") as f:
                    f.write(f"❌ Failed to initialize OpenAI client: {type(e).__name__}: {str(e)}\n")
                    import traceback
                    f.write(f"📋 OpenAI Init Traceback: {traceback.format_exc()}\n")
                self.openai_client = None
        return self.openai_client

    def _get_groq_client(self):
        """Lazy initialization of Groq client"""
        if self.groq_client is None:
            try:
                with open("debug_ai.log", "a") as f:
                    f.write(f"🔧 Initializing Groq client...\n")
                self.groq_client = groq.AsyncGroq(
                    api_key=settings.groq_api_key
                )
                with open("debug_ai.log", "a") as f:
                    f.write(f"✅ Groq client initialized successfully\n")
            except Exception as e:
                with open("debug_ai.log", "a") as f:
                    f.write(f"❌ Failed to initialize Groq client: {type(e).__name__}: {str(e)}\n")
                    import traceback
                    f.write(f"📋 Groq Init Traceback: {traceback.format_exc()}\n")
                self.groq_client = None
        return self.groq_client

    async def generate_summary(self, transcript: str) -> CallSummary:
        """Generate call summary with fallback providers"""
        start_time = time.time()

        # Try OpenAI first (using HTTP to avoid client library issues)
        try:
            summary = await self._generate_with_openai(transcript)
            summary.provider_used = "openai"
            summary.generation_time = time.time() - start_time
            return summary
        except Exception as e:
            print(f"OpenAI failed: {str(e)}")

        # Fallback to Groq (if available)
        try:
            summary = await self._generate_with_groq(transcript)
            summary.provider_used = "groq"  
            summary.generation_time = time.time() - start_time
            return summary
        except Exception as e:
            print(f"Groq failed: {str(e)}")

        # Emergency fallback
        print("Using emergency fallback summary")
        return self._create_emergency_summary(transcript, time.time() - start_time)

    async def _generate_with_openai(self, transcript: str) -> CallSummary:
        """Generate summary using OpenAI via direct HTTP"""
        import json
        import aiohttp
        
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {settings.openai_api_key}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "model": "gpt-4o-mini",
                    "messages": [
                        {
                            "role": "system",
                            "content": """You are a call center AI assistant. Analyze the conversation transcript and extract key information. 
                            Respond ONLY with a JSON object containing these exact fields:
                            {
                                "customer_name": "extracted or 'Customer'",
                                "issue_type": "brief category",
                                "key_points": ["point1", "point2", "point3"],
                                "current_status": "status description",
                                "recommended_actions": ["action1", "action2", "action3"],
                                "customer_sentiment": "sentiment description"
                            }"""
                        },
                        {
                            "role": "user",
                            "content": f"Analyze this call transcript and extract the information: {transcript}"
                        }
                    ],
                    "temperature": 0.1,
                    "max_tokens": 500
                }
                
                async with session.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers=headers,
                    json=payload
                ) as response:
                    if response.status != 200:
                        raise Exception(f"OpenAI API error: {response.status}")
                    
                    result = await response.json()
                    ai_response = result["choices"][0]["message"]["content"].strip()
                    
                    # Parse the AI response
                    try:
                        ai_data = json.loads(ai_response)
                        return CallSummary(
                            customer_name=ai_data.get("customer_name", "Customer"),
                            issue_type=ai_data.get("issue_type", "General Inquiry"),
                            key_points=ai_data.get("key_points", ["Customer needs assistance"]),
                            current_status=ai_data.get("current_status", "In Progress"),
                            recommended_actions=ai_data.get("recommended_actions", ["Review customer needs"]),
                            customer_sentiment=ai_data.get("customer_sentiment", "Neutral"),
                            provider_used="openai",
                            generation_time=0.0
                        )
                    except json.JSONDecodeError:
                        return self._parse_text_response(ai_response, "openai")
                        
        except Exception as e:
            with open("debug_ai.log", "a") as f:
                f.write(f"❌ OpenAI HTTP error: {str(e)}\n")
            raise e

    async def _generate_with_groq(self, transcript: str) -> CallSummary:
        """Generate summary using Groq"""
        client = self._get_groq_client()
        if client is None:
            raise Exception("Groq client initialization failed")
            
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": """You are a call center AI assistant. Analyze the conversation transcript and extract key information. 
                    Respond ONLY with a JSON object containing these exact fields:
                    {
                        "customer_name": "extracted or 'Customer'",
                        "issue_type": "brief category",
                        "key_points": ["point1", "point2", "point3"],
                        "current_status": "status description",
                        "recommended_actions": ["action1", "action2", "action3"],
                        "customer_sentiment": "sentiment description"
                    }"""
                },
                {
                    "role": "user",
                    "content": f"Analyze this call transcript and extract the information: {transcript}"
                }
            ],
            temperature=0.1,
            max_tokens=500
        )

        try:
            # Extract and parse the AI response
            ai_response = response.choices[0].message.content.strip()
            print(f"Groq raw response: {ai_response}")
            
            # Try to parse JSON response
            import json
            try:
                ai_data = json.loads(ai_response)
                return CallSummary(
                    customer_name=ai_data.get("customer_name", "Customer"),
                    issue_type=ai_data.get("issue_type", "Technical Support"),
                    key_points=ai_data.get("key_points", ["Customer needs technical assistance"]),
                    current_status=ai_data.get("current_status", "In Progress"),
                    recommended_actions=ai_data.get("recommended_actions", ["Provide technical support"]),
                    customer_sentiment=ai_data.get("customer_sentiment", "Patient"),
                    provider_used="groq",
                    generation_time=0.0
                )
            except json.JSONDecodeError:
                # If JSON parsing fails, extract information from text
                return self._parse_text_response(ai_response, "groq")
                
        except Exception as e:
            print(f"Error processing Groq response: {e}")
            raise e

    def _parse_text_response(self, ai_response: str, provider: str) -> CallSummary:
        """Fallback method to parse text response when JSON parsing fails"""
        # Simple text analysis for key information
        lines = ai_response.lower().split('\n')
        
        # Extract basic information from text
        customer_name = "Customer"
        issue_type = "General Inquiry"
        key_points = ["Customer needs assistance", "Requires agent attention"]
        current_status = "In Progress"
        recommended_actions = ["Review customer needs", "Provide appropriate assistance"]
        customer_sentiment = "Neutral"
        
        # Try to extract more specific information from the response
        if "login" in ai_response.lower() or "password" in ai_response.lower():
            issue_type = "Authentication Issue"
            key_points = ["Customer having login/password issues"]
            recommended_actions = ["Reset password", "Verify account security"]
        elif "billing" in ai_response.lower() or "charge" in ai_response.lower():
            issue_type = "Billing Inquiry"
            key_points = ["Customer has billing concerns"]
            recommended_actions = ["Review billing history", "Explain charges"]
        elif "technical" in ai_response.lower() or "connection" in ai_response.lower():
            issue_type = "Technical Support"
            key_points = ["Customer experiencing technical issues"]
            recommended_actions = ["Troubleshoot technical problems", "Check system status"]
        
        # Check sentiment indicators
        if any(word in ai_response.lower() for word in ["frustrated", "angry", "upset"]):
            customer_sentiment = "Frustrated"
        elif any(word in ai_response.lower() for word in ["happy", "satisfied", "pleased"]):
            customer_sentiment = "Positive"
        elif any(word in ai_response.lower() for word in ["patient", "understanding"]):
            customer_sentiment = "Patient"
        
        return CallSummary(
            customer_name=customer_name,
            issue_type=issue_type,
            key_points=key_points,
            current_status=current_status,
            recommended_actions=recommended_actions,
            customer_sentiment=customer_sentiment,
            provider_used=provider,
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