'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RoomComponent } from '@/components/room-component';
import { useAppStore } from '@/lib/store';

export default function AgentBPage() {
  const router = useRouter();
  const {
    // Call state from Zustand store
    roomName,
    token,
    participantName,
    
    // Actions from Zustand store
    generateToken,
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
      // Use the same shared room name as caller and agent A
      const roomName = 'main-call-room';
      
      await generateToken(roomName, name, 'agent_b');
      setParticipantInfo(name, 'agent_b');
      
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
  if (token && roomName) {
    return (
      <div className="min-h-screen bg-background dark p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">🎩 Agent B Interface</h1>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-sm">
                  Connected as: {participantName}
                </Badge>
                <Badge variant="default" className="bg-purple-500">
                  🟣 Specialist Agent
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

          {/* Agent Controls */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎩 Agent B Controls
              </CardTitle>
              <CardDescription>
                Receive transferred calls with full context and provide specialized support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="default" className="h-12">
                    ✅ Accept Transfer
                  </Button>
                  <Button variant="outline" className="h-12">
                    📜 View Call History
                  </Button>
                  <Button variant="destructive" className="h-12">
                    📞 End Call
                  </Button>
                </div>
                <div className="grid gap-3 text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xs font-semibold text-purple-600 dark:text-purple-400">1</div>
                    <p>Receive transferred calls from Agent A with complete conversation context</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-semibold text-blue-600 dark:text-blue-400">2</div>
                    <p>Access AI-generated call summaries and customer sentiment analysis</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-xs font-semibold text-green-600 dark:text-green-400">3</div>
                    <p>Provide specialized support and resolution with full background</p>
                  </div>
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
            <div className="text-6xl mb-2">👨‍💼</div>
            <CardTitle className="text-3xl">Join as Agent B</CardTitle>
            <CardDescription className="text-lg">
              Receive transferred calls with full context and provide specialized support
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
                  <span>Joining as Agent B...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>🚀 Join as Agent B</span>
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
