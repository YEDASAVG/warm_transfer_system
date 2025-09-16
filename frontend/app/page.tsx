"use client";

import React, { useState } from 'react';
import { LoginScreen } from '@/components/LoginScreen';
import { CallerScreen } from '@/components/CallerScreen';
import { AgentADashboard } from '@/components/AgentADashboard';
import { AgentBScreen } from '@/components/AgentBScreen';
import { useCallState } from '@/hooks/useCallState';

type UserRole = 'caller' | 'agentA' | 'agentB';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserRole | null>(null);
  const { 
    callState, 
    updateCallState, 
    createRoom, 
    generateToken, 
    initiateTransfer, 
    confirmTransfer, 
    endCall,
    isLoading,
    error,
    clearError
  } = useCallState();

  const handleLogin = async (role: UserRole) => {
    setCurrentUser(role);
    
    // Auto-create room and generate token when user logs in
    if (role === 'caller' || role === 'agentA') {
      try {
        const roomName = `room-${Date.now()}`;
        
        // Set names first based on role
        const participantName = role === 'caller' ? 'John Smith' : 'Sarah Chen';
        const userRole = role === 'caller' ? 'caller' : 'agent_a';
        
        // Update names in state
        if (role === 'caller') {
          updateCallState({ callerName: 'John Smith' });
        } else {
          updateCallState({ agentAName: 'Sarah Chen' });
        }
        
        // Create room with proper participant name
        const response = await createRoom(roomName, participantName, userRole);
        
        // Store both room name and room ID from response
        updateCallState({ 
          roomName: roomName,
          roomId: response.room_id 
        });
        
      } catch (err) {
        console.error('Failed to setup call:', err);
      }
    }
  };

  const resetDemo = () => {
    setCurrentUser(null);
    endCall(callState.roomName);
    clearError();
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background dark">
      {/* Demo Reset Button */}
      <button
        onClick={resetDemo}
        className="fixed top-4 right-4 z-50 bg-secondary/80 backdrop-blur-sm border border-border text-foreground px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-sm"
      >
        Reset Demo
      </button>

      {/* Error Display */}
      {error && (
        <div className="fixed top-4 left-4 z-50 bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg max-w-md">
          <div className="flex justify-between items-center">
            <span className="text-sm">{error}</span>
            <button onClick={clearError} className="ml-2 hover:opacity-70">×</button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-foreground">Processing...</span>
            </div>
          </div>
        </div>
      )}

      {currentUser === 'caller' && (
        <CallerScreen 
          callState={callState} 
          updateCallState={updateCallState} 
        />
      )}
      
      {currentUser === 'agentA' && (
        <AgentADashboard 
          callState={callState} 
          updateCallState={updateCallState}
          onInitiateTransfer={(transcript: string) => 
            callState.roomId ? initiateTransfer(callState.roomId, transcript) : Promise.reject('No room ID available')
          }
          onConfirmTransfer={(summary: string) => 
            callState.roomId ? confirmTransfer(callState.roomId, summary, callState.agentBName) : Promise.reject('No room ID available')
          }
        />
      )}
      
      {currentUser === 'agentB' && (
        <AgentBScreen 
          callState={callState} 
          updateCallState={updateCallState} 
        />
      )}
    </div>
  );
}
