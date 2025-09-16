import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, Pause, Play, User } from 'lucide-react';
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
  transferStatus: 'none' | 'initiated' | 'summary-ready' | 'inviting-agent' | 'agent-joining' | 'complete';
}

interface CallerScreenProps {
  callState: CallState;
  updateCallState: (updates: Partial<CallState>) => void;
}

export function CallerScreen({ callState, updateCallState }: CallerScreenProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentAgent = callState.transferStatus === 'complete' ? callState.agentBName : callState.agentAName;

  return (
    <div className="min-h-screen bg-background">
      {/* Status Banner */}
      <StatusBanner transferStatus={callState.transferStatus} userRole="caller" />

      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg text-foreground">CallConnect Pro</h1>
              <p className="text-sm text-muted-foreground">Customer Interface</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20">
            Connected
          </Badge>
        </div>
      </div>

      {/* Main Interface */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Agent Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  {/* Agent Avatar */}
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto border-2 border-primary/20">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </div>

                  {/* Agent Info */}
                  <div>
                    <h3 className="text-lg text-foreground">{currentAgent}</h3>
                    <p className="text-muted-foreground">
                      {callState.transferStatus === 'complete' ? 'Specialist Agent' : 'Support Agent'}
                    </p>
                  </div>

                  {/* Call Status */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-muted-foreground">
                        {callState.isOnHold ? 'On Hold' : 'Connected'}
                      </span>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="text-2xl font-mono text-foreground text-center">
                        {formatDuration(callState.duration)}
                      </div>
                      <p className="text-xs text-muted-foreground text-center mt-1">Call Duration</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call Controls */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-xl text-foreground mb-2">Call Controls</h2>
                    <p className="text-muted-foreground">Manage your call settings</p>
                  </div>

                  {/* Control Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Mute */}
                    <div className="text-center">
                      <Button
                        variant={callState.isMuted ? "destructive" : "outline"}
                        size="lg"
                        className="w-16 h-16 rounded-full p-0 mb-2"
                        onClick={() => updateCallState({ isMuted: !callState.isMuted })}
                      >
                        {callState.isMuted ? (
                          <MicOff className="w-6 h-6" />
                        ) : (
                          <Mic className="w-6 h-6" />
                        )}
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        {callState.isMuted ? 'Unmute' : 'Mute'}
                      </p>
                    </div>

                    {/* Video */}
                    <div className="text-center">
                      <Button
                        variant={!callState.isVideoEnabled ? "destructive" : "outline"}
                        size="lg"
                        className="w-16 h-16 rounded-full p-0 mb-2"
                        onClick={() => updateCallState({ isVideoEnabled: !callState.isVideoEnabled })}
                      >
                        {callState.isVideoEnabled ? (
                          <Video className="w-6 h-6" />
                        ) : (
                          <VideoOff className="w-6 h-6" />
                        )}
                      </Button>
                      <p className="text-sm text-muted-foreground">Video</p>
                    </div>

                    {/* Hold */}
                    <div className="text-center">
                      <Button
                        variant={callState.isOnHold ? "default" : "outline"}
                        size="lg"
                        className="w-16 h-16 rounded-full p-0 mb-2"
                        onClick={() => updateCallState({ isOnHold: !callState.isOnHold })}
                      >
                        {callState.isOnHold ? (
                          <Play className="w-6 h-6" />
                        ) : (
                          <Pause className="w-6 h-6" />
                        )}
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        {callState.isOnHold ? 'Resume' : 'Hold'}
                      </p>
                    </div>

                    {/* Speaker */}
                    <div className="text-center">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-16 h-16 rounded-full p-0 mb-2"
                      >
                        <Volume2 className="w-6 h-6" />
                      </Button>
                      <p className="text-sm text-muted-foreground">Speaker</p>
                    </div>
                  </div>

                  {/* End Call */}
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="destructive"
                      size="lg"
                      className="w-20 h-20 rounded-full p-0"
                      onClick={() => updateCallState({ isActive: false })}
                    >
                      <PhoneOff className="w-8 h-8" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Transfer Information */}
        {callState.transferStatus !== 'none' && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg text-foreground">Transfer in Progress</h3>
                <div className="space-y-2">
                  {callState.transferStatus === 'initiated' && (
                    <p className="text-muted-foreground">Your agent is preparing to transfer you to a specialist...</p>
                  )}
                  {callState.transferStatus === 'summary-ready' && (
                    <p className="text-muted-foreground">Transfer summary is being prepared...</p>
                  )}
                  {callState.transferStatus === 'inviting-agent' && (
                    <p className="text-muted-foreground">Inviting specialist agent to join the call...</p>
                  )}
                  {callState.transferStatus === 'agent-joining' && (
                    <p className="text-muted-foreground">{callState.agentBName} is joining the call...</p>
                  )}
                  {callState.transferStatus === 'complete' && (
                    <p className="text-green-600 dark:text-green-400">You are now connected with {callState.agentBName}</p>
                  )}
                </div>
                
                {/* Progress dots */}
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        (callState.transferStatus === 'initiated' && step <= 1) ||
                        (callState.transferStatus === 'summary-ready' && step <= 2) ||
                        (callState.transferStatus === 'inviting-agent' && step <= 3) ||
                        (callState.transferStatus === 'agent-joining' && step <= 4) ||
                        (callState.transferStatus === 'complete' && step <= 4)
                          ? 'bg-primary'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}