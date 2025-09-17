'use client';

import React, { useState, useEffect } from 'react';
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
    transferRoomId,
    transferStatus,
    transferSummary,
    transcript,
    summary,
    callerName,
    
    // Actions from Zustand store
    generateToken,
    setParticipantInfo,
    updateCallState,
    isLoading,
    error,
    clearError,
    reset
  } = useAppStore();
  
  const [name, setName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [localError, setLocalError] = useState<string>('');

  // Debug transfer state and force refresh from localStorage
  useEffect(() => {
    console.log('🔍 Agent B - Transfer state changed:', { 
      transferStatus, 
      transferRoomId, 
      hasSummary: !!summary,
      hasTranscript: !!transcript 
    });
    
    // Force refresh from localStorage every 2 seconds to catch cross-tab updates
    const interval = setInterval(() => {
      const storedState = localStorage.getItem('warm-transfer-store');
      if (storedState) {
        try {
          const parsed = JSON.parse(storedState);
          console.log('🔄 Agent B - localStorage state:', parsed.state);
          
          // If localStorage has a transfer but our state doesn't, update it
          if (parsed.state?.transferStatus !== 'none' && transferStatus === 'none') {
            console.log('🔄 Forcing state update from localStorage');
            updateCallState({
              transferStatus: parsed.state.transferStatus,
              transferRoomId: parsed.state.transferRoomId,
              transferSummary: parsed.state.transferSummary,
              summary: parsed.state.summary,
              transcript: parsed.state.transcript
            });
          }
        } catch (e) {
          console.log('Error parsing localStorage:', e);
        }
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [transferStatus, transferRoomId, summary, transcript, updateCallState]);

  const handleJoinRoom = async () => {
    if (!name.trim()) {
      setLocalError('Please enter your name');
      return;
    }

    setIsJoining(true);
    setLocalError('');
    clearError();

    try {
      // Check if there's an active transfer
      if (transferStatus === 'inviting-agent' && transferRoomId) {
        console.log('Agent B joining transfer room:', transferRoomId);
        // For transfer, use the specific transfer room
        await generateToken(transferRoomId, name, 'agent_b');
        setParticipantInfo(name, 'agent_b');
        
        // Set room as active for Agent B
        updateCallState({ 
          isActive: true, 
          roomName: transferRoomId,
          roomId: transferRoomId,
          transferStatus: 'agent-joining'
        });
      } else {
        // No active transfer - show error
        setLocalError('No active transfer available. Agent B can only join during warm transfers initiated by Agent A.');
        return;
      }
      
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
                {(summary || transcript) && (
                  <Badge variant="default" className="bg-green-500">
                    ✅ With Context
                  </Badge>
                )}
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
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Live Call */}
            <div className="lg:col-span-2">
              <div className="h-[600px]">
                <RoomComponent
                  token={token}
                  serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL || 'wss://localhost:7880'}
                  roomName={roomName}
                  onDisconnected={handleLeaveRoom}
                />
              </div>
            </div>

            {/* Transfer Context */}
            <div className="lg:col-span-1 space-y-6">
              {/* AI Summary */}
              {summary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      🧠 AI Summary
                    </CardTitle>
                    <CardDescription>
                      Context from Agent A
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-foreground">Customer:</span>
                        <p className="text-sm text-muted-foreground">{summary.customer_name}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-foreground">Issue Type:</span>
                        <p className="text-sm text-muted-foreground">{summary.issue_type}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-foreground">Status:</span>
                        <p className="text-sm text-muted-foreground">{summary.current_status}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-foreground">Sentiment:</span>
                        <p className="text-sm text-muted-foreground">{summary.customer_sentiment}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-foreground">Key Points:</span>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                          {summary.key_points.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-foreground">Recommended Actions:</span>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                          {summary.recommended_actions.map((action, index) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Full Conversation */}
              {transcript && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      💬 Full Conversation
                    </CardTitle>
                    <CardDescription>
                      Complete transcript from Agent A
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted rounded-lg p-4 max-h-64 overflow-y-auto">
                      <div className="space-y-2 text-sm">
                        {transcript.split('. ').map((sentence, index) => {
                          if (!sentence.trim()) return null;
                          
                          const isCustomer = sentence.toLowerCase().includes('customer:') || 
                                           sentence.toLowerCase().includes('caller:');
                          
                          return (
                            <div key={index} className={`p-2 rounded ${
                              isCustomer 
                                ? 'bg-blue-50 dark:bg-blue-900/20' 
                                : 'bg-green-50 dark:bg-green-900/20'
                            }`}>
                              <span className={`font-medium ${
                                isCustomer ? 'text-blue-700 dark:text-blue-400' : 'text-green-700 dark:text-green-400'
                              }`}>
                                {isCustomer ? callerName || 'Customer' : 'Agent A'}:
                              </span>
                              <span className="ml-2 text-foreground">
                                {sentence.replace(/^(Customer:|Caller:|Agent:|User:)\s*/i, '').trim()}.
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* No Context Warning */}
              {!summary && !transcript && transferStatus === 'agent-joining' && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">⚠️</div>
                      <h3 className="text-lg font-medium text-foreground mb-2">No Transfer Context</h3>
                      <p className="text-sm text-muted-foreground">
                        Transfer context not available. Please ask the customer to repeat their issue.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
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
            {/* Transfer Status Indicator - Only show if transfer is actually ready */}
            {(transferStatus === 'inviting-agent' || transferStatus === 'summary-ready') && transferRoomId && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 dark:text-green-400 font-semibold">Transfer Ready</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-300">
                  A warm transfer is ready. Join to receive the call with full context.
                </p>
              </div>
            )}
            
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
