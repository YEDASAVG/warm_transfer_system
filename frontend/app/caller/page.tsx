'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RoomComponent } from '@/components/room-component';
import { useAppStore } from '@/lib/store';

export default function CallerPage() {
  const router = useRouter();
  const {
    // Call state from Zustand store
    isActive,
    roomName,
    token,
    participantName,
    
    // Actions from Zustand store
    createRoom,
    setParticipantInfo,
    isLoading,
    error,
    clearError,
    reset
  } = useAppStore();
  
  const [name, setName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [localError, setLocalError] = useState<string>('');

  const handleJoinRoom = async () => {
    if (!name.trim()) {
      setLocalError('Please enter your name');
      return;
    }

    setIsJoining(true);
    setLocalError('');
    clearError();

    try {
      // Use a shared room name so all participants join the same room
      const roomName = 'main-call-room';
      
      await createRoom(roomName, name, 'caller');
      setParticipantInfo(name, 'caller');
      
    } catch (err) {
      setLocalError('Failed to join room. Please check your connection and try again.');
      console.error('Failed to join room:', err);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveRoom = () => {
    reset();
  };

  const handleBackHome = () => {
    router.push('/');
  };

  // If joined and active, show the call interface
  if (isActive && token && roomName) {
    return (
      <div className="min-h-screen bg-background dark p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">📞 Caller Interface</h1>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-sm">
                  Connected as: {participantName}
                </Badge>
                <Badge variant="default" className="bg-green-500">
                  🟢 Live Call
                </Badge>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleLeaveRoom}>
                Leave Room
              </Button>
              <Button variant="secondary" onClick={handleBackHome}>
                Back to Home
              </Button>
            </div>
          </div>

          {/* Room Component */}
          <div className="h-[600px]">
            <RoomComponent
              token={token}
              serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL || 'wss://localhost:7880'}
              roomName={roomName}
              onDisconnected={handleLeaveRoom}
            />
          </div>

          {/* Instructions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💡 How This Works
              </CardTitle>
              <CardDescription>
                Your guide to the warm transfer process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-semibold text-blue-600 dark:text-blue-400">1</div>
                  <p>You are now connected to the call room with real audio/video</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-xs font-semibold text-green-600 dark:text-green-400">2</div>
                  <p>Agent A will join automatically to assist you</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xs font-semibold text-purple-600 dark:text-purple-400">3</div>
                  <p>During the call, Agent A may transfer you to Agent B for specialized help</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-xs font-semibold text-orange-600 dark:text-orange-400">4</div>
                  <p>The transfer will be seamless with AI-powered context sharing</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show join form
  return (
    <div className="min-h-screen bg-background dark flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <Card className="border-2">
          <CardHeader className="text-center space-y-4">
            <div className="text-6xl mb-2">📞</div>
            <CardTitle className="text-3xl">Join as Caller</CardTitle>
            <CardDescription className="text-lg">
              Enter your name to start a live video call with our support team
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
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
                  <span>Joining Room...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>🚀 Join Call Room</span>
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