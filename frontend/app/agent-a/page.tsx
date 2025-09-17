'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AgentADashboard } from '@/components/AgentADashboard';
import { useAppStore } from '@/lib/store';

export default function AgentAPage() {
  const router = useRouter();
  const {
    // Call state from Zustand store
    isActive,
    roomId,
    token,
    
    // Actions from Zustand store
    createRoom,
    generateToken,
    updateCallState,
    initiateTransfer,
    confirmTransfer,
    setParticipantInfo,
    isLoading,
    error,
    clearError,
    reset
  } = useAppStore();
  
  const [name, setName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [localError, setLocalError] = useState<string>('');

  const handleInitiateTransfer = async (transcript: string) => {
    console.log('🔄 Agent A handleInitiateTransfer called with transcript:', transcript.substring(0, 100));
    if (!roomId) throw new Error('No room ID available');
    
    console.log('📞 Calling store initiateTransfer with roomId:', roomId);
    const result = await initiateTransfer(roomId, transcript);
    console.log('✅ Transfer result:', result);
    return result;
  };

  const handleConfirmTransfer = async (summary: string) => {
    if (!roomId) throw new Error('No room ID available');
    
    await confirmTransfer(roomId, summary, 'Specialist Agent');
  };

  const handleJoinRoom = async () => {
    if (!name.trim()) {
      setLocalError('Please enter your agent name');
      return;
    }

    setIsJoining(true);
    setLocalError('');
    clearError();

    try {
      setParticipantInfo(name, 'agent_a');
      // Agent A should join the existing room created by caller, not create a new one
      await generateToken('main-call-room', name, 'agent_a');
      // Manually set the room as active since generateToken doesn't do this
      updateCallState({ 
        isActive: true, 
        roomName: 'main-call-room',
        roomId: 'main-call-room'
      });
      
      // Start the call timer manually since generateToken doesn't start it
      const { startDurationTimer } = useAppStore.getState();
      startDurationTimer();
      
    } catch (error) {
      console.error('Failed to join room:', error);
      setLocalError('Failed to join dashboard. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleBackHome = () => {
    router.push('/');
  };

  // If joined, show the sophisticated dashboard
  if (isActive && token && roomId) {
    return (
      <AgentADashboard 
        onInitiateTransfer={handleInitiateTransfer}
        onConfirmTransfer={handleConfirmTransfer}
      />
    );
  }

  // Show join form
  return (
    <div className="min-h-screen bg-background dark flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <Card className="border-2">
          <CardHeader className="text-center space-y-4">
            <div className="text-6xl mb-2">👩‍💼</div>
            <CardTitle className="text-3xl">Join as Agent A</CardTitle>
            <CardDescription className="text-lg">
              Access the professional agent dashboard to handle calls and initiate warm transfers
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Agent Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your agent name"
                className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                disabled={isJoining || isLoading}
              />
            </div>

            {(localError || error) && (
              <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                ⚠️ {localError || error}
              </div>
            )}

            <Button
              onClick={handleJoinRoom}
              disabled={isJoining || isLoading || !name.trim()}
              className="w-full h-12 text-base"
              size="lg"
            >
              {(isJoining || isLoading) ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Joining Dashboard...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>🚀 Access Agent Dashboard</span>
                </div>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleBackHome}
              className="w-full"
              size="lg"
            >
              ← Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}