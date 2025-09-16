import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Phone, PhoneOff, Mic, MicOff, CheckCircle, Clock, User, FileText, Bell } from 'lucide-react';
import { StatusBanner } from './StatusBanner';

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
}

interface AgentBScreenProps {
  callState: CallState;
  updateCallState: (updates: Partial<CallState>) => void;
}

export function AgentBScreen({ callState, updateCallState }: AgentBScreenProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [hasJoinedCall, setHasJoinedCall] = useState(false);

  useEffect(() => {
    if (callState.transferStatus === 'inviting-agent') {
      setShowNotification(true);
    }
  }, [callState.transferStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleJoinCall = () => {
    setHasJoinedCall(true);
    setShowNotification(false);
    updateCallState({ transferStatus: 'agent-joining' });
    
    setTimeout(() => {
      updateCallState({ transferStatus: 'complete' });
    }, 2000);
  };

  const handleDeclineTransfer = () => {
    setShowNotification(false);
    updateCallState({ transferStatus: 'none' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Status Banner */}
      <StatusBanner transferStatus={callState.transferStatus} userRole="agentB" />

      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg text-foreground">CallConnect Pro</h1>
              <p className="text-sm text-muted-foreground">Agent B Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20">
              Agent B Ready
            </Badge>
            <div className="text-sm text-muted-foreground">{callState.agentBName}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4">
        {/* Transfer Notification */}
        {showNotification && callState.transferStatus === 'inviting-agent' && (
          <Card className="mb-6 border-purple-200 dark:border-purple-500/20 bg-purple-50/50 dark:bg-purple-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg text-foreground mb-2">Incoming Warm Transfer</h3>
                  <p className="text-muted-foreground mb-4">
                    {callState.agentAName} wants to transfer customer {callState.callerName} to you.
                  </p>
                  
                  {/* Preview Summary */}
                  {callState.transferSummary && (
                    <div className="bg-card rounded-lg p-4 mb-4 border border-border">
                      <h4 className="flex items-center gap-2 mb-2 text-foreground">
                        <FileText className="w-4 h-4" />
                        Transfer Summary
                      </h4>
                      <p className="text-sm text-muted-foreground">{callState.transferSummary}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={handleJoinCall}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept Transfer
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleDeclineTransfer}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Status & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Agent Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Agent Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-foreground">{callState.agentBName}</h3>
                  <p className="text-sm text-muted-foreground">Specialist Agent</p>
                </div>

                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${
                      callState.transferStatus === 'complete' ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'
                    }`}></div>
                    <span className="text-sm text-muted-foreground">
                      {callState.transferStatus === 'complete' ? 'On Call' : 'Available'}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Specialization</div>
                    <div className="text-sm text-foreground">Account Security</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call Information */}
            {(hasJoinedCall || callState.transferStatus === 'complete') && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    Current Call
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Customer Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="text-foreground">{callState.callerName}</h4>
                      <p className="text-sm text-muted-foreground">Customer</p>
                    </div>
                  </div>

                  {/* Call Duration */}
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="text-xl font-mono text-foreground">
                      {formatDuration(callState.duration)}
                    </div>
                    <p className="text-xs text-muted-foreground">Total Duration</p>
                  </div>

                  {/* Call Controls */}
                  <div className="flex gap-2 pt-2">
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
            )}
          </div>

          {/* Transfer Context */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Transfer Context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {callState.transferStatus === 'none' && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="mb-2 text-foreground">Waiting for Transfers</h3>
                    <p>You'll be notified when an agent wants to transfer a call to you.</p>
                  </div>
                )}

                {callState.transferSummary && (
                  <div className="space-y-4">
                    <Alert>
                      <FileText className="h-4 w-4" />
                      <AlertDescription>
                        <strong className="text-foreground">Transfer Summary from {callState.agentAName}:</strong>
                        <br />
                        <span className="text-muted-foreground">{callState.transferSummary}</span>
                      </AlertDescription>
                    </Alert>

                    {/* Customer Details */}
                    <div className="bg-muted rounded-lg p-4">
                      <h4 className="mb-3 text-foreground">Customer Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="text-foreground">{callState.callerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Call Duration:</span>
                          <span className="text-foreground">{formatDuration(callState.duration)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Previous Agent:</span>
                          <span className="text-foreground">{callState.agentAName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Items */}
                    {callState.transferStatus === 'complete' && (
                      <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg p-4">
                        <h4 className="text-green-800 dark:text-green-400 mb-2">Recommended Actions</h4>
                        <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                          <li>• Reset customer password</li>
                          <li>• Review security settings</li>
                          <li>• Document resolution in customer record</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {callState.transferStatus === 'agent-joining' && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <h3 className="text-foreground mb-2">Joining Call...</h3>
                    <p className="text-muted-foreground">Connecting you with {callState.callerName}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}