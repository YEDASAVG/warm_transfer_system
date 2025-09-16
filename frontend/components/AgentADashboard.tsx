import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Phone, PhoneOff, Mic, MicOff, ArrowRight, FileText, Clock, User, Zap, Brain, Activity } from 'lucide-react';
import { StatusBanner } from './StatusBanner';
import { TransferSummaryModal } from './TransferSummaryModal';

interface CallState {
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
  roomId?: string;
  roomName?: string;
}

interface AgentADashboardProps {
  callState: CallState;
  updateCallState: (updates: Partial<CallState>) => void;
  onInitiateTransfer?: (transcript: string) => Promise<string>;
  onConfirmTransfer?: (summary: string) => Promise<void>;
}

export function AgentADashboard({ callState, updateCallState, onInitiateTransfer, onConfirmTransfer }: AgentADashboardProps) {
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Simulate live transcript updates when call is active
  useEffect(() => {
    if (callState.isActive && callState.transcript.length < 200) {
      const sampleTranscript = "Customer: Hi, I'm having trouble with my account login. Agent: I'd be happy to help you with that. Can you please provide your account email? Customer: Sure, it's john.smith@email.com. Agent: Thank you. I can see your account here. It looks like there was a security lock placed on it yesterday due to multiple failed login attempts.";
      
      const timer = setTimeout(() => {
        const nextChar = sampleTranscript[callState.transcript.length];
        if (nextChar) {
          updateCallState({ 
            transcript: callState.transcript + nextChar 
          });
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [callState.transcript, callState.isActive, updateCallState]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInitiateTransfer = async () => {
    if (onInitiateTransfer) {
      try {
        await onInitiateTransfer(callState.transcript);
        setShowTransferModal(true);
      } catch (error) {
        console.error('Failed to initiate transfer:', error);
      }
    } else {
      // Fallback to simulated behavior
      updateCallState({ transferStatus: 'initiated' });
      
      setTimeout(() => {
        const summary = "Customer John Smith is experiencing account login issues due to security lock from multiple failed attempts yesterday. Account email: john.smith@email.com. Requires password reset and security review.";
        updateCallState({ 
          transferStatus: 'summary-ready',
          transferSummary: summary
        });
        setShowTransferModal(true);
      }, 2000);
    }
  };

  const handleConfirmTransfer = async (editedSummary: string) => {
    setShowTransferModal(false);
    
    if (onConfirmTransfer) {
      try {
        await onConfirmTransfer(editedSummary);
      } catch (error) {
        console.error('Failed to confirm transfer:', error);
      }
    } else {
      // Fallback to simulated behavior
      updateCallState({ 
        transferSummary: editedSummary,
        transferStatus: 'inviting-agent'
      });

      setTimeout(() => {
        updateCallState({ transferStatus: 'agent-joining' });
      }, 2000);

      setTimeout(() => {
        updateCallState({ transferStatus: 'complete' });
      }, 4000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Status Banner */}
      <StatusBanner transferStatus={callState.transferStatus} userRole="agentA" />

      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg text-foreground">CallConnect Pro</h1>
              <p className="text-sm text-muted-foreground">Agent A Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20">
              Agent A Active
            </Badge>
            <div className="text-sm text-muted-foreground">{callState.agentAName}</div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Call Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Active Call */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  Active Call
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-foreground">{callState.callerName}</h3>
                    <p className="text-sm text-muted-foreground">Customer</p>
                  </div>
                </div>

                {/* Call Stats */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="text-lg font-mono text-foreground">
                      {formatDuration(callState.duration)}
                    </div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-500/10 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">Live</div>
                    <p className="text-xs text-muted-foreground">Status</p>
                  </div>
                </div>

                {/* Call Controls */}
                <Separator />
                <div className="flex gap-2">
                  <Button
                    variant={callState.isMuted ? "destructive" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => updateCallState({ isMuted: !callState.isMuted })}
                  >
                    {callState.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => updateCallState({ isActive: false })}
                  >
                    <PhoneOff className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transfer Options */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-primary" />
                  Transfer Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {callState.transferStatus === 'none' && (
                  <div className="space-y-3">
                    <Button 
                      className="w-full"
                      onClick={handleInitiateTransfer}
                      disabled={!callState.isActive}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Initiate Warm Transfer
                    </Button>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-primary" />
                        <span className="text-sm text-foreground">AI Assistant</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        System will analyze the conversation and generate a summary automatically
                      </p>
                    </div>
                  </div>
                )}

                {callState.transferStatus === 'initiated' && (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-sm text-muted-foreground">Generating AI summary...</p>
                  </div>
                )}

                {(callState.transferStatus === 'summary-ready' || 
                  callState.transferStatus === 'inviting-agent' || 
                  callState.transferStatus === 'agent-joining') && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Transfer in progress
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setShowTransferModal(true)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Summary
                    </Button>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-sm text-foreground">Next: {callState.agentBName}</p>
                      <p className="text-xs text-muted-foreground">Specialist Agent</p>
                    </div>
                  </div>
                )}

                {callState.transferStatus === 'complete' && (
                  <div className="text-center py-3">
                    <div className="text-green-600 dark:text-green-400 mb-2">✓ Transfer Complete</div>
                    <p className="text-sm text-muted-foreground">
                      Customer connected to {callState.agentBName}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Live Transcript */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Live Transcript
                  <Badge variant="outline" className="ml-auto">
                    <Activity className="w-3 h-3 mr-1" />
                    Real-time
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <ScrollArea className="h-96 w-full">
                  <div className="space-y-4">
                    {callState.transcript ? (
                      <div className="space-y-3">
                        {callState.transcript.split('. ').map((sentence, index) => {
                          if (!sentence.trim()) return null;
                          
                          const isCustomer = sentence.toLowerCase().includes('customer:') || 
                                           sentence.toLowerCase().includes('sure,') ||
                                           sentence.toLowerCase().includes('hi,') ||
                                           sentence.toLowerCase().includes('john.smith@email.com');
                          
                          return (
                            <div key={index} className={`flex gap-3 ${isCustomer ? 'justify-start' : 'justify-end'}`}>
                              <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                                isCustomer 
                                  ? 'bg-muted text-foreground' 
                                  : 'bg-primary/10 text-foreground border border-primary/20'
                              }`}>
                                <div className="text-xs mb-1 text-muted-foreground">
                                  {isCustomer ? callState.callerName : callState.agentAName}
                                </div>
                                <div className="text-sm">
                                  {sentence.replace(/^(Customer:|Agent:)\s*/, '').trim()}.
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Typing indicator */}
                        <div className="flex justify-start">
                          <div className="bg-muted p-3 rounded-lg">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Transcript will appear here when the call begins...</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* AI Insights */}
                {callState.transcript && (
                  <div className="mt-4 bg-muted rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">AI Insights</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sentiment:</span>
                        <span className="text-yellow-600 dark:text-yellow-400">Neutral</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Issue Type:</span>
                        <span className="text-blue-600 dark:text-blue-400">Authentication</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Urgency:</span>
                        <span className="text-orange-600 dark:text-orange-400">Medium</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recommended:</span>
                        <span className="text-green-600 dark:text-green-400">Transfer to Specialist</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Transfer Summary Modal */}
      <TransferSummaryModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onConfirm={handleConfirmTransfer}
        summary={callState.transferSummary}
        callerName={callState.callerName}
        agentBName={callState.agentBName}
      />
    </div>
  );
}