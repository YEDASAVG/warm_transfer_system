import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import type { RoomCreateRequest, RoomCreateResponse, TransferRequest } from '@/lib/types';

export interface CallState {
  isActive: boolean;
  isOnHold: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  duration: number;
  callerName: string;
  agentAName: string;
  agentBName: string;
  transcript: string;
  transferStatus: 'none' | 'initiated' | 'summary-ready' | 'inviting-agent' | 'agent-joining' | 'complete';
  transferSummary: string;
  roomName?: string;
  roomId?: string;
  token?: string;
}

export function useCallState() {
  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    isOnHold: false,
    isMuted: false,
    isVideoEnabled: false,
    duration: 0,
    callerName: 'Customer',
    agentAName: 'Agent A',
    agentBName: 'Agent B',
    transcript: '',
    transferStatus: 'none',
    transferSummary: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState.isActive && !callState.isOnHold) {
      interval = setInterval(() => {
        setCallState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState.isActive, callState.isOnHold]);

  const updateCallState = (updates: Partial<CallState>) => {
    setCallState(prev => ({ ...prev, ...updates }));
  };

  const createRoom = async (roomName: string, participantName: string, role: 'caller' | 'agent_a' | 'agent_b' = 'caller') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.createRoom({ 
        room_name: roomName,
        participant_name: participantName,
        role: role
      });
      
      updateCallState({ 
        roomName: roomName,
        roomId: response.room_id,
        isActive: true,
        token: response.token
      });
      
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const generateToken = async (roomName: string, participantName: string, role: 'caller' | 'agent_a' | 'agent_b' = 'caller') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.joinRoom({
        room_name: roomName,
        participant_name: participantName,
        role: role
      });
      
      updateCallState({ token: response.token });
      return response.token;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate token');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const initiateTransfer = async (roomId: string, transcript: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      updateCallState({ transferStatus: 'initiated' });
      
      const response = await apiClient.initiateTransfer({
        caller_room_id: roomId,
        agent_a_id: callState.agentAName,
        mock_transcript: transcript
      });
      
      // Convert CallSummary to string for display
      const summaryText = `Issue: ${response.summary.issue_type}\nKey Points: ${response.summary.key_points.join(', ')}\nStatus: ${response.summary.current_status}\nSentiment: ${response.summary.customer_sentiment}`;
      
      updateCallState({ 
        transferStatus: 'summary-ready',
        transferSummary: summaryText
      });
      
      return summaryText;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate transfer');
      updateCallState({ transferStatus: 'none' });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmTransfer = async (roomId: string, summary: string, agentBName: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      updateCallState({ 
        transferStatus: 'inviting-agent',
        transferSummary: summary 
      });
      
      // For now, simulate the transfer process
      // In future, this could call a transfer confirmation endpoint
      console.log('Transfer confirmed:', { roomId, summary, agentBName });
      
      // Simulate agent joining process
      setTimeout(() => {
        updateCallState({ transferStatus: 'agent-joining' });
      }, 2000);
      
      setTimeout(() => {
        updateCallState({ transferStatus: 'complete' });
      }, 4000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm transfer');
      updateCallState({ transferStatus: 'summary-ready' });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const endCall = async (roomName?: string) => {
    // Note: Room cleanup could be added here if needed
    if (roomName) {
      console.log('Ending call for room:', roomName);
    }
    
    setCallState({
      isActive: false,
      isOnHold: false,
      isMuted: false,
      isVideoEnabled: false,
      duration: 0,
      callerName: 'Customer',
      agentAName: 'Agent A',
      agentBName: 'Agent B',
      transcript: '',
      transferStatus: 'none',
      transferSummary: '',
      roomName: undefined,
      roomId: undefined,
      token: undefined,
    });
  };

  return {
    callState,
    updateCallState,
    createRoom,
    generateToken,
    initiateTransfer,
    confirmTransfer,
    endCall,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}